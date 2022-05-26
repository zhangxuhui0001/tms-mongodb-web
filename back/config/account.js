const custom = require('./custom')
module.exports = {
  disabled: false,
  mongodb: {
    disabled: false,
    name: 'master',
    database: 'tms_koa_account',
    collection: 'account',
    // schema: {"test": {type: 'string', title: '测试'}}, // 自定义冗余字段
  },
  redis: {
    disabled: true,
    name: 'master'
  },
  // accounts: [
  //   {
  //     id: 1,
  //     username: 'user1',
  //     password: 'user1',
  //     isAdmin: true,
  //     allowMultiLogin: true
  //   },
  // ],
  admin: { username: 'admin', password: 'admin' },
  accountBeforeEach: (ctx) => {
    if (custom && custom.unencryption && typeof custom.unencryption == 'function') {
      return custom.unencryption(ctx)
    } else {
      let { username, password } = ctx.request.body
      return { username, password }
    }
  },
  authConfig: {
    pwdErrMaxNum: 5, // int 密码错误次数限制 0 不限制
    authLockDUR: 300,   // int 登录锁定时长 （秒）
    pwdStrengthCheck: {
      min: 8, // 密码最小长度
      max: 20, // 密码最大长度
      pwdBlack: ["P@ssw0rd"], // 密码黑名单
      containProjects: { mustCheckNum: 3, contains: ["digits", "uppercase", "lowercase", "symbols"] }, // 是否包含数字、大写字母、小写字母、特殊字符, 至少满足其中length项
      hasSpaces: false, // 是否包含空格
      hasAccount: false,
      hasKeyBoardContinuousChar: false,
      // hasKeyBoardContinuousCharSize: 4
    }
  },
  // captchaConfig: {
  //   disabled: false,   // boolean 是否启用验证码
  //   storageType: "redis", // 验证码存储方式  lowdb | redis
  //   masterCaptcha: "aabb",   // string 万能验证码
  //   codeSize: 4,
  //   alphabet: "1234567890"
  //   alphabetType: "number,upperCase,lowerCase",
  //   expire: 300, // 过期时间 s
  // }
}