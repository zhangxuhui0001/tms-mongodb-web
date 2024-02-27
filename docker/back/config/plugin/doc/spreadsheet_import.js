const {
  TMW_PLUGIN_DOC_SPREADSHEET_IMPORT_DISABLED: Disabled,
  TMW_PLUGIN_DOC_SPREADSHEET_IMPORT_DB_BLACK_LIST: DbBlacklist,
  TMW_PLUGIN_DOC_SPREADSHEET_IMPORT_CL_BLACK_LIST: ClBlacklist,
  TMW_PLUGIN_DOC_SPREADSHEET_IMPORT_SCHEMA_BLACK_LIST: SchemaBlacklist,
  TMW_PLUGIN_WIDGET_URL_HOST,
  TMW_PLUGIN_DOC_SPREADSHEET_IMPORT_NAME: Name,
  TMW_PLUGIN_DOC_SPREADSHEET_IMPORT_BUCKET: Bucket,
  TMW_PLUGIN_DOC_SPREADSHEET_IMPORT_DB: Db,
  TMW_PLUGIN_DOC_SPREADSHEET_IMPORT_CL: Cl,
  TMW_PLUGIN_DOC_SPREADSHEET_IMPORT_SCHEMA: Schema,
  TMW_PLUGIN_DOC_SPREADSHEET_IMPORT_TITLE: Title,
  TMW_PLUGIN_DOC_SPREADSHEET_IMPORT_WIDGET_URL,
  TMW_PLUGIN_DOC_SPREADSHEET_IMPORT_DOWNLOAD_HOST: DownloadHost,
} = process.env

// 插件前端页面地址
const widgetUrl = TMW_PLUGIN_DOC_SPREADSHEET_IMPORT_WIDGET_URL
  ? TMW_PLUGIN_DOC_SPREADSHEET_IMPORT_WIDGET_URL
  : TMW_PLUGIN_WIDGET_URL_HOST
  ? TMW_PLUGIN_WIDGET_URL_HOST + '/plugin/doc-spreadsheet-import'
  : '/plugin/doc-spreadsheet-import'

export default {
  disabled: /true|yes/i.test(Disabled),
  spreadsheet: true,
  dbBlacklist: DbBlacklist,
  clBlacklist: ClBlacklist,
  schemaBlacklist: SchemaBlacklist,
  widgetUrl,
  name: Name ? Name : 'doc-spreadsheet-import',
  title: Title ? Title : '导入数据',
  bucket: Bucket,
  db: Db,
  cl: Cl,
  schema: Schema,
  downloadHost: DownloadHost,
}
