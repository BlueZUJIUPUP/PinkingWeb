import request from '@/utils/request'

export function getcaseList(params) {
  return request({
    url: '/testcase',
    method: 'get',
    params
  })
}
