import store from '../store'
/**
 * 获取缓存下拉框
 * @param {*} baseRequest 请求选项
 * @param {*} url 请求路径
 * @param {*} codes 请求参数
 */
export function cacheOptions(baseRequest, url, codes) {
  return new Promise((resolve, reject) => {
    const result = {}
    if (codes instanceof Array && codes.length > 0) {
      const newCodes = []
      for (const code of codes) {
        if (store.state.app.cacheOptions.hasOwnProperty(code + '')) {
          result[code + ''] = store.state.app.cacheOptions[code + '']
        } else {
          newCodes.push(code)
        }
      }
      if (newCodes.length > 0) {
        baseRequest(url, { codes: newCodes }).then(response => {
          const item = response.data.item
          for (const key in item) {
            store.commit('SET_CACHE_OPTIONS', {
              code: key,
              options: item[key]
            })
            result[key] = item[key]
          }
          resolve(result)
        })
      } else {
        resolve(result)
      }
    }
  })
}
