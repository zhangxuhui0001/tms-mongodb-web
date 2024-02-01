import { TmsAxios } from 'tms-vue3'
import { BACK_API_URL } from '@/global'
import { ApiRst } from './types'

export default {
  list(bucket: string | undefined, dbName: string) {
    const base = BACK_API_URL() + '/admin/cldir'
    const params = { bucket, db: dbName }
    return TmsAxios.ins('mongodb-api')
      .get(`${base}/list`, { params })
      .then((rst: ApiRst) => rst.data.result)
  },
  create(bucket: string | undefined, dbName: string, proto: any) {
    const base = BACK_API_URL() + '/admin/cldir'
    const params = { bucket, db: dbName }
    return TmsAxios.ins('mongodb-api')
      .post(`${base}/create`, proto, { params })
      .then((rst: ApiRst) => rst.data.result)
  },
  update(bucket: string | undefined, dbName: string, newClDir: any) {
    const base = BACK_API_URL() + '/admin/cldir'
    const id = newClDir._id
    const params = { bucket, db: dbName, id }
    const updated = JSON.parse(JSON.stringify(newClDir))
    delete updated._id
    return TmsAxios.ins('mongodb-api')
      .post(`${base}/update`, updated, { params })
      .then((rst: ApiRst) => rst.data.result)
  },
  remove(bucket: string | undefined, dbName: string, id: string) {
    const base = BACK_API_URL() + '/admin/cldir'
    const params = { bucket, db: dbName, id }
    return TmsAxios.ins('mongodb-api')
      .get(`${base}/remove`, { params })
      .then((rst: ApiRst) => rst.data.result)
  },
}
