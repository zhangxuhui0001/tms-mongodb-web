import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { TmsAxiosPlugin, TmsAxios } from 'tms-vue3'
import { Frame, Flex } from 'tms-vue3-ui'
import router from './router'
import App from './App.vue'
import ElementPlus, { ElMessage } from 'element-plus'
import { getLocalToken, setLocalToken } from './global'
import './index.css'
import 'element-plus/dist/index.css'
import 'tms-vue3-ui/dist/es/frame/style/index.css'
import 'tms-vue3-ui/dist/es/flex/style/index.css'
import './assets/common.scss'

function initFunc() {
  let token = getLocalToken()
  if (!token) return router.push('/login')
  let authToken = `Bearer ${token}`
  let rulesObj: any = {
    requestHeaders: new Map([['Authorization', authToken]]),
    onResultFault: (res: any) => {
      return new Promise((resolve, reject) => {
        ElMessage.error(res.data.msg || '发生业务逻辑错误')
        reject(res.data)
      })
    },
    onRetryAttempt: (res: any) => {
      return new Promise((resolve, reject) => {
        if (res.data.code === 20001) {
          ElMessage({
            showClose: true,
            message: res.data.msg || '登录失效请重新登录',
            type: 'error',
            onClose: function () {
              setLocalToken('')
              router.push('/login')
            },
          })
        }
        reject(res.data)
      })
    },
  }
  let rule = TmsAxios.newInterceptorRule(rulesObj)
  TmsAxios.ins({ name: 'mongodb-api', rules: [rule] })
}

TmsAxios.ins({ name: 'auth-api' })

TmsAxios.ins({ name: 'master-api' })

const app = createApp(App)
let settings // 全局设置
try {
  let rsp = await TmsAxios.ins('master-api').get('/settings.json')
  settings = rsp.data
} catch (e) {
  settings = {}
}

localStorage.debug = '*'

app
  .use(router)
  .use(createPinia())
  .use(TmsAxiosPlugin)
  .use(Frame)
  .use(Flex)
  .use(initFunc)
  .use(ElementPlus)
  .mount('#app')