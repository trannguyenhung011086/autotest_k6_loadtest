import { config, globalChecks } from '../common/index.js'
import http from 'k6/http'
import { sleep } from 'k6'
import { Trend, Rate, Counter } from 'k6/metrics'

export let GetProductDuration = new Trend('Get product Duration')
export let GetProductChecks = new Rate('Get product Checks')
export let GetProductReqs = new Counter('Get product Requests')

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

    globalChecks(res, duration) || GetProductChecks.add(1)
    GetProductDuration.add(res.timings.duration)
    GetProductReqs.add(1)

    sleep(1)
}