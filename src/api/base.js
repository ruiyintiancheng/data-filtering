/*
 * @Author: lk
 * @Date: 2019-02-01 17:35:14
 * @Last Modified by: lk
 * @Last Modified time: 2019-09-24 10:30:18
 */

import request from '@/utils/request'
import { deepClone } from '@/utils'
import store from '@/store'
import { validateParams } from '@/utils/validate'
import { validateInputs } from '@/utils/index'

export function getMenu() {
  return request({
    url: '/function/getmenu',
    method: 'post'
  })
}

export function baseSearchList(query, url) {
  return request({
    url: url,
    method: 'post',
    data: JSON.stringify(validateParams(query))
  })
}

export function baseRequest(url, query) {
  return new Promise(resolve => {
    const params = JSON.stringify(query ? validateInputs(query) : query)
    const cacheData = store.state.app.cacheData
    const result = cacheData.find(
      item => item.url === url && item.params === params
    )
    if (result) {
      resolve(deepClone(result.response))
    } else {
      request({
        url: url,
        method: 'post',
        data: params
      }).then(response => {
        if (
          response &&
          response.data &&
          response.data.params &&
          response.data.params.clientCache === '1'
        ) {
          store.dispatch('addCacheData', {
            url: url,
            params: params,
            response: deepClone(response)
          })
        }
        resolve(response)
      })
    }
  })
}

export function baseSearch(url, query) {
  return request({
    url: url,
    method: 'post',
    data: JSON.stringify(validateParams(query))
  })
}

export function baseUpload(url, query) {
  return request({
    url: url,
    method: 'post',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: query
  })
}

export function baseDownLoad(url, query) {
  return request({
    url: url,
    method: 'post',
    data: JSON.stringify(query ? validateInputs(query) : query),
    responseType: 'blob'
  })
}
