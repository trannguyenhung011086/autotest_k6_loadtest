import { config, globalChecks } from '../common/index.js'
import * as helper from '../common/helper.js'
import http from 'k6/http'
import { sleep } from 'k6'
import { Trend, Rate, Counter } from 'k6/metrics'

export let GetProductDuration = new Trend('Get product Duration')
export let GetProductFailRate = new Rate('Get product Fail Rate')
export let GetProductReqs = new Counter('Get product Requests')

let duration = 300
let rate = 0.1

export let options = {
    thresholds: {
        'Get product Duration': [`p(95)<${duration}`],
        'Get product Fail Rate': [`rate<${rate}`]
    }
}

export function setup() {
    let saleInfo = helper.getSale()
    return { sale: saleInfo }
}

export default function (data) {
    let products = JSON.parse(data.sale).products
    let random = Math.floor(Math.random() * products.length)

    let res = http.get(__ENV.HOST + config.api.product + products[random].id)
    // console.log('product: ' + (JSON.parse(res.body)).title + ' ' + (JSON.parse(res.body)).id)

    globalChecks(res, duration) || GetProductFailRate.add(1)
    GetProductDuration.add(res.timings.duration)
    GetProductReqs.add(1)

    sleep(1)
}