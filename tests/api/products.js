import { config, globalChecks } from '../../common/index.js'
import * as helper from '../../common/helper.js'
import http from 'k6/http'
import { sleep } from 'k6'
import { Trend, Rate, Counter } from 'k6/metrics'

export let GetProductDuration = new Trend('Get product info Duration')
export let GetProductFailRate = new Rate('Get product info Fail Rate')
export let GetProductReqs = new Counter('Get product info Requests')

let duration = 1000
let rate = 0.05

export let options = {
    thresholds: {
        'Get product info Duration': [`p(95)<${duration}`],
        'Get product info Fail Rate': [`rate<${rate}`]
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

    let check = globalChecks(res, duration)
    GetProductFailRate.add(!check)
    GetProductDuration.add(res.timings.duration)
    GetProductReqs.add(1)

    sleep(1)
}