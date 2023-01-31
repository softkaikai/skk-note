import axios from 'axios'

// 是否正在刷新的标记
let isRefreshing = false
//重试队列
let requests = []
service.interceptors.response.use(
  response => {
    //约定code 409 token 过期
    if (response.data.code === 409) {
      if (!isRefreshing) {
        isRefreshing = true
        //调用刷新token的接口
        return refreshToken().then(res => {
          const { token } = res.data
          // 替换token
          setToken(token)
          response.headers.Authorization = `${token}`
           // token 刷新后将数组的方法重新执行
          requests.forEach((cb) => cb(token))
          requests = [] // 重新请求完清空
          return service(response.config)
        }).catch(err => {
          //跳到登录页
          removeToken()
          router.push('/login')
          return Promise.reject(err)
        }).finally(() => {
          isRefreshing = false
        })
      } else {
        // 返回未执行 resolve 的 Promise
        return new Promise(resolve => {
          // 用函数形式将 resolve 存入，等待刷新后再执行
          requests.push(token => {
            response.headers.Authorization = `${token}`
            resolve(service(response.config))
          })
        })
      }
    }
    return response && response.data
  },
  (error) => {
    return Promise.reject(error)
  }
)

