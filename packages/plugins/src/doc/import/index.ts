import { PluginBase } from 'tmw-kit/dist/model'
import { loadConfig, ModelSchema, ModelDoc } from 'tmw-kit'
import { createDocWebhook } from 'tmw-kit/dist/webhook/document'
import * as path from 'path'
import { pinyin } from 'pinyin-pro'
import * as _ from 'lodash'
import Debug from 'debug'

const debug = Debug('tmw:plugins:doc-import')

/**配置文件存放位置*/
const ConfigDir = path.resolve(
  process.env.TMS_KOA_CONFIG_DIR || process.cwd() + '/config'
)

// 插件配置文件地址
const ConfigFile =
  process.env.TMW_PLUGIN_DOC_IMPORT_CONFIG_NAME ||
  './plugin/doc/import'

/**
 * 导入数据到集合中
 */
class ImportPlugin extends PluginBase {
  constructor(file: string) {
    super(file)
    this.name = 'doc-import'
    this.title = '从文件导入数据'
    this.description = '导入excel、json文件格式的数据，并导入集合中。'
    this.scope = 'document'
    this.amount = 'zero'
    this.beforeWidget = { name: 'external', url: '', size: '60%' }
  }

  async execute(ctrl: any, tmwCl: any) {
    const [ok, docsOrCause] = await this.findRequestDocs(ctrl, tmwCl)

    if (ok === false) return { code: 10001, msg: docsOrCause }

    const file = ctrl.request.body.widget.file
    if (!file) {
      return { code: 10001, msg: '文件上传失败' }
    }

    let rowsJson = JSON.parse(file)
    if (!Array.isArray(rowsJson) || rowsJson.length === 0)
      return { code: 10001, msg: '上传的文件数据为空或格式错误' }

    const { name: clName, schema_id, extensionInfo } = tmwCl

    const modelDoc = new ModelDoc(ctrl.mongoClient, ctrl.bucket, ctrl.client)
    const docWebhook = createDocWebhook(process.env.TMW_APP_WEBHOOK)

    const modelSchema = new ModelSchema(
      ctrl.mongoClient,
      ctrl.bucket,
      ctrl.client
    )
    // 集合的schema定义
    let columns
    if (schema_id && typeof schema_id === 'string')
      columns = await modelSchema.bySchemaId(schema_id)

    // 补充公共属性
    if (extensionInfo) {
      const { info, schemaId } = extensionInfo
      if (schemaId) {
        const publicSchema = await modelSchema.bySchemaId(schemaId)
        Object.keys(publicSchema).forEach((schema) => {
          rowsJson[schema] = info[schema] ? info[schema] : ''
        })
      }
    }

    let schemaStr = ''
    if (columns) {
      for (const k in columns) {
        schemaStr += k + ','
      }
    }
    debug(`schemaStr[${schemaStr}]`)

    let extra = process.env.TMW_PLUGIN_DOC_IMPORT_EXTRA_KEY_NAME || 'extra'
    let finishRows = rowsJson.map((row) => {
      let newRow: any = {}
      if (columns) {
        for (const k in columns) {
          let column = columns[k]
          let rDByTitle = row[column.title]
          if (typeof rDByTitle === 'number') {
            newRow[k] = String(rDByTitle)
          } else if (typeof rDByTitle === 'undefined') {
            // 单选
            if (
              column.type === 'string' &&
              column.enum &&
              column.enum.length &&
              column.default &&
              column.default.length
            ) {
              newRow[k] = column.enum.find(
                (ele) => ele.value === column.default
              ).label
            } else if (
              column.type === 'array' &&
              column.enum &&
              column.enum.length &&
              column.default &&
              column.default.length
            ) {
              const target = column.enum.map((ele) => {
                if (column.default.includes(ele.value)) {
                  return ele.label
                }
              })
              newRow[k] = target.join(',')
            } else {
              //存在默认值
              newRow[k] = column.default || null
            }
          } else {
            newRow[k] = rDByTitle
          }
        }
      }
      
      for (let k in row) {
        let oneRow = _.get(row, k)

        if (typeof oneRow === 'number')
          oneRow = String(oneRow)

        if (schemaStr.indexOf(k) > -1) {
          if (newRow[k] === null) _.set(newRow, k, oneRow)
        } else if (k.indexOf('.') > -1 && typeof _.get(columns, k) === 'object') {
          _.set(newRow, k.split('.'), oneRow)
        } else {
          // 检查是否包含中文
          if (/[\u4E00-\u9FA5]+/g.test(k)) {
            k = pinyin(k, { toneType: 'none' })
            k = k.replace(/ +/g, '_')
          }
          _.set(newRow, [extra, k], oneRow)
        }
      }

      // 加工数据
      modelDoc.processBeforeStore(newRow, 'insert', columns)

      return newRow
    })

    try {
      // 通过webhook处理数据
      let beforeRst: any = await docWebhook.beforeCreate(finishRows, tmwCl)

      if (beforeRst.passed !== true)
        return {
          code: 10001,
          msg: beforeRst.reason || '操作被Webhook.beforeCreate阻止',
        }

      if (beforeRst.rewrited && typeof beforeRst.rewrited === 'object')
        finishRows = beforeRst.rewrited
    
      // 数据存储到集合中
      const rst = await this.findSysColl(ctrl, tmwCl)
        .insertMany(finishRows)
        .then(async (r) => {
          debug(`导入的数据已存储到[db=${tmwCl.db.name}][cl=${clName}]`)
          await modelDoc.dataActionLog(r.ops, '创建', tmwCl.db.name, clName)
          return finishRows
        })

      // 通过webhook处理数据
      let afterRst: any = await docWebhook.afterCreate(rst, tmwCl)
      if (afterRst.passed !== true)
        return {
          code: 10001,
          msg: afterRst.reason || '操作被Webhook.afterCreate阻止',
        }

      return { code: 0, msg: '导入成功' }

    } catch (error) {
      debug(`数据存储错误: ${error.message}`)
      return { code: 10001, msg: error.message }
    }
  }

  private findSysColl(ctrl, tmwCl) {
    let { mongoClient } = ctrl
    let sysCl = mongoClient.db(tmwCl.db.sysname).collection(tmwCl.sysname)

    return sysCl
  }
}

export function createPlugin(file: string) {
  let config
  if (ConfigFile) config = loadConfig(ConfigDir, ConfigFile)
  if (config && typeof config === 'object') {
    let { widgetUrl, bucket, db, cl, schema, title,
      disabled, dbBlacklist, clBlacklist, schemaBlacklist } = config
    const newPlugin = new ImportPlugin(file)
    newPlugin.beforeWidget.url = widgetUrl

    if (bucket) newPlugin.bucketName = new RegExp(bucket)
    if (db) newPlugin.dbName = new RegExp(db)
    if (cl) newPlugin.clName = new RegExp(cl)
    if (schema) newPlugin.schemaName = new RegExp(schema)

    if (title && typeof title === 'string') newPlugin.title = title

    if (disabled) newPlugin.disabled = disabled
    if (dbBlacklist) newPlugin.dbBlacklist = new RegExp(dbBlacklist)
    if (clBlacklist) newPlugin.clBlacklist = new RegExp(clBlacklist)
    if (schemaBlacklist) newPlugin.schemaBlacklist = new RegExp(schemaBlacklist)

    return newPlugin
  }

  return false
}