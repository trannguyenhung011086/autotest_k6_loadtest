import { config, globalChecks } from '../../common/index.js'
import * as helper from '../../common/helper.js'
import http from 'k6/http'
import { sleep } from 'k6'
import { Trend, Rate, Counter } from 'k6/metrics'

export let ViewProductDuration = new Trend('View product Duration')
export let ViewProductFailRate = new Rate('View product Fail Rate')
export let ViewProductReqs = new Counter('View product Requests')

let duration = 500
let rate = 0.05

export let options = {
    thresholds: {
        'View product Duration': [`p(95)<${duration}`],
        'View product Fail Rate': [`rate<${rate}`]
    }
}

export function setup() {
    let saleInfo = helper.getSale()
    return { sale: saleInfo }
}

export default function (data) {
    let products = JSON.parse(data.sale).products
    let random = Math.floor(Math.random() * products.length)

    let res = http.get(__ENV.HOST + '/products/' + products[random].id)
    // console.log('product: ' + (JSON.parse(res.body)).title + ' ' + (JSON.parse(res.body)).id)

    let check = globalChecks(res, duration)
    ViewProductFailRate.add(!check)
    ViewProductDuration.add(res.timings.duration)
    ViewProductReqs.add(1)

    sleep(1)
}