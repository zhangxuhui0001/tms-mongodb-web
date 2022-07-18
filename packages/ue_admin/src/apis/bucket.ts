import { TmsAxios } from 'tms-vue3'
import { BACK_API_URL } from '@/global'

const base = BACK_API_URL() + '/admin/bucket'

type ApiRst = {
  data: { result: any }
}
export default {
  list() {
    return TmsAxios.ins('mongodb-api')
      .get(`${base}/list`)
      .then((rst: ApiRst) => rst.data.result)
  },
  create(proto: any) {
    return TmsAxios.ins('mongodb-api')
      .post(`${base}/create`, proto)
      .then((rst: ApiRst) => rst.data.result)
  },
  update(bucketName: any, updated: any) {
    return TmsAxios.ins('mongodb-api')
      .post(`${base}/update?bucket=${bucketName}`, updated)
      .then((rst: ApiRst) => rst.data.result)
  },
  remove(bucket: { name: any }) {
    return TmsAxios.ins('mongodb-api')
      .get(`${base}/remove?bucket=${bucket.name}`)
      .then((rst: ApiRst) => rst.data.result)
  },
}
