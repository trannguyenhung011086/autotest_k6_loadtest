import config from '../common/config.js'
import http from 'k6/http'
import { check, sleep, group } from 'k6'
import { Trend, Rate, Counter } from 'k6/metrics'

export let BrandsDuration = new Trend('Brands Duration')
export let BrandNoProductDuration = new Trend('Brand with no product Duration')
export let BrandWithProductDuration = new Trend('Brand with products Duration')

export let BrandsChecks = new Rate('Brands Checks')
export let BrandNoProductChecks = new Rate('Brand with no product Checks')
export let BrandWithProductChecks = new Rate('Brand with products Checks')

export let BrandsReqs = new Counter('Brands Requests')
export let BrandNoProductReqs = new Counter('Brand with no product Requests')
export let BrandWithProductReqs = new Counter('Brand with products Requests')

export let options = {
    vus: 10,
    duration: '30s',
    thresholds: {
        'Brands Duration': ['p(95)<500'],
        'Brand with no product Duration': ['p(95)<500'],
        'Brand with products Duration': ['p(95)<500']
    }
}

export function setup() {
    let brandList = []
    let res = http.get(__ENV.HOST + config.api.brands)
    res.body = JSON.parse(res.body)

    for (let item of Object.keys(res.body)) {
        let list = res.body[item]
        for (let listItem of list) {
            brandList.push(listItem)
        }
    }
    console.log('total brands: ' + brandList.length)
    return brandList
}

export default function (data) {
    group('GET / brands API', () => {
        let res = http.get(__ENV.HOST + config.api.brands)

        check(res, {
            'status is 200': res => res.status == 200,
            'transaction time is less than 500ms': res => res.timings.duration < 500
        }) || BrandsChecks.add(1)
        BrandsDuration.add(res.timings.duration)
        BrandsReqs.add(1)

        sleep(1)
    })

    group('GET / brand detail API', () => {
        let random = Math.floor((Math.random() * data.length) + 1)

        let res = http.get(__ENV.HOST + config.api.brands + data[random].id)
        res.body = JSON.parse(res.body)

        if (res.body.products.length == 0) {
            check(res, {
                'status is 200': res => res.status == 200,
                'transaction time is less than 500ms': res => res.timings.duration < 500
            }) || BrandNoProductChecks.add(1)
            BrandNoProductDuration.add(res.timings.duration)
            BrandNoProductReqs.add(1)
            console.log('index: ' + random + ' brand: ' + res.body.name + ' ' + res.body.id + ' (no product)')
        } else {
            check(res, {
                'status is 200': res => res.status == 200,
                'transaction time is less than 500ms': res => res.timings.duration < 500
            }) || BrandWithProductChecks.add(1)
            BrandWithProductDuration.add(res.timings.duration)
            BrandWithProductReqs.add(1)
            console.log('index: ' + random + ' brand: ' + res.body.name + ' ' + res.body.id + ' (with products)')
        }

        sleep(1)
    })
}