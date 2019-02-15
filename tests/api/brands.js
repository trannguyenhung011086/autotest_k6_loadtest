// import { config, Helper } from '../../common/index.js'
import { config } from '../../common/config.js'
import * as helper from '../../common/helper.js'
import http from 'k6/http'
import { sleep, group } from 'k6'
import { Trend, Rate, Counter } from 'k6/metrics'

export let BrandsDuration = new Trend('Get brands Duration')
export let BrandNoProductDuration = new Trend('Get brand with no product Duration')
export let BrandWithProductDuration = new Trend('Get brand with products Duration')

export let BrandsFailRate = new Rate('Get brands Fail Rate')
export let BrandNoProductFailRate = new Rate('Get brand with no product Fail Rate')
export let BrandWithProductFailRate = new Rate('Get brand with products Fail Rate')

export let BrandsReqs = new Counter('Get brands Requests')
export let BrandNoProductReqs = new Counter('Get brand with no product Requests')
export let BrandWithProductReqs = new Counter('Get brand with products Requests')

let duration = 1000
let rate = 0.05

export let options = {
    thresholds: {
        'Get brands Duration': [`p(95)<${duration}`],
        'Get brands Fail Rate': [`rate<${rate}`],
        'Get brand with no product Duration': [`p(95)<${duration}`],
        'Get brand with no product Fail Rate': [`rate<${rate}`],
        'Get brand with products Duration': [`p(95)<${duration}`],
        'Get brand with products Fail Rate': [`rate<${rate}`]
    }
}

export function setup() {
    let brandList = helper.getBrandList()
    return { brands: brandList }
}

export default function (data) {
    group('GET / brands API', () => {
        let res = http.get(__ENV.HOST + config.api.brands)

        let check = helper.globalChecks(res, duration)
        BrandsFailRate.add(!check)
        BrandsDuration.add(res.timings.duration)
        BrandsReqs.add(1)

        sleep(1)
    })

    group('GET / brand detail API', () => {
        let random = Math.floor(Math.random() * data.brands.length)

        let res = http.get(__ENV.HOST + config.api.brands + data.brands[random].id)
        res.body = JSON.parse(res.body)

        if (res.body.products.length == 0) {
            let check = helper.globalChecks(res, duration)
            BrandNoProductFailRate.add(!check)
            BrandNoProductDuration.add(res.timings.duration)
            BrandNoProductReqs.add(1)
            // console.log('Get brand: ' + res.body.name + ' ' + res.body.id + ' (no product)')
        } else {
            let check = helper.globalChecks(res, duration)
            BrandWithProductFailRate.add(!check)
            BrandWithProductDuration.add(res.timings.duration)
            BrandWithProductReqs.add(1)
            // console.log('Get brand: ' + res.body.name + ' ' + res.body.id + ' (with products)')
        }

        sleep(1)
    })
}