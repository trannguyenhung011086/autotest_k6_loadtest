import config from '../common/config.js'
import http from 'k6/http'
import { check, sleep } from 'k6'
import { Trend } from 'k6/metrics'

export let GetProductDuration = new Trend('Get product Duration')

let duration = 300
export let options = {
    vus: 10,
    duration: '30s',
    thresholds: {
        'Get product Duration': [`p(95)<${duration}`]
    }
}

export function setup() {
    let res = http.get(__ENV.HOST + config.api.todaySales)
    let sales = JSON.parse(res.body)
    let sale = http.get(__ENV.HOST + config.api.sales + sales[0].id)
    return sale.body
}

export default function (data) {
    let products = JSON.parse(data).products
    let random = Math.floor(Math.random() * products.length)

    let res = http.get(__ENV.HOST + config.api.product + products[random].id)
    console.log('product: ' + (JSON.parse(res.body)).title + ' ' + (JSON.parse(res.body)).id)

    check(res, {
        'status is OK': res => res.status == 200,
        'transaction time is less than threshold': res => res.timings.duration < duration
    })
    GetProductDuration.add(res.timings.duration)

    sleep(1)
}