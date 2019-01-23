import { config, globalChecks } from '../common/index.js'
import * as helper from '../common/helper.js'
import http from 'k6/http'
import { sleep, group } from 'k6'
import { Trend, Rate, Counter } from 'k6/metrics'

export let BrandsDuration = new Trend('Brands Duration')
export let BrandNoProductDuration = new Trend('Brand with no product Duration')
export let BrandWithProductDuration = new Trend('Brand with products Duration')

export let BrandsFailRate = new Rate('Brands Fail Rate')
export let BrandNoProductFailRate = new Rate('Brand with no product Fail Rate')
export let BrandWithProductFailRate = new Rate('Brand with products Fail Rate')

export let BrandsReqs = new Counter('Brands Requests')
export let BrandNoProductReqs = new Counter('Brand with no product Requests')
export let BrandWithProductReqs = new Counter('Brand with products Requests')

let duration = 500
let rate = 0.05

export let options = {
    thresholds: {
        'Brands Duration': [`p(95)<${duration}`],
        'Brands Fail Rate': [`rate<${rate}`],
        'Brand with no product Duration': [`p(95)<${duration}`],
        'Brand with no product Fail Rate': [`rate<${rate}`],
        'Brand with products Duration': [`p(95)<${duration}`],
        'Brand with products Fail Rate': [`rate<${rate}`]
    }
}

export function setup() {
    let brandList = helper.getBrandList()
    return { brands: brandList }
}

export default function (data) {
    group('GET / brands API', () => {
        let res = http.get(__ENV.HOST + config.api.brands)

        let check = globalChecks(res, duration)
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
            let check = globalChecks(res, duration)
            BrandNoProductFailRate.add(!check)
            BrandNoProductDuration.add(res.timings.duration)
            BrandNoProductReqs.add(1)
            // console.log('brand: ' + res.body.name + ' ' + res.body.id + ' (no product)')
        } else {
            let check = globalChecks(res, duration)
            BrandWithProductFailRate.add(!check)
            BrandWithProductDuration.add(res.timings.duration)
            BrandWithProductReqs.add(1)
            // console.log('brand: ' + res.body.name + ' ' + res.body.id + ' (with products)')
        }

        sleep(1)
    })
}