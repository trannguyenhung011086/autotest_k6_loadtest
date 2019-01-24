import { config, globalChecks } from '../../common/index.js'
import * as helper from '../../common/helper.js'
import http from 'k6/http'
import { sleep, group } from 'k6'
import { Trend, Rate, Counter } from 'k6/metrics'

export let BrandsDuration = new Trend('View brands Duration')
export let BrandNoProductDuration = new Trend('View brand with no product Duration')
export let BrandWithProductDuration = new Trend('View brand with products Duration')

export let BrandsFailRate = new Rate('View brands Fail Rate')
export let BrandNoProductFailRate = new Rate('View brand with no product Fail Rate')
export let BrandWithProductFailRate = new Rate('View brand with products Fail Rate')

export let BrandsReqs = new Counter('View brands Requests')
export let BrandNoProductReqs = new Counter('View brand with no product Requests')
export let BrandWithProductReqs = new Counter('View brand with products Requests')

let duration = 3000
let rate = 0.05

export let options = {
    thresholds: {
        'View brands Duration': [`p(95)<${duration}`],
        'View brands Fail Rate': [`rate<${rate}`],
        'View brand with no product Duration': [`p(95)<${duration}`],
        'View brand with no product Fail Rate': [`rate<${rate}`],
        'View brand with products Duration': [`p(95)<${duration}`],
        'View brand with products Fail Rate': [`rate<${rate}`]
    }
}

export function setup() {
    let brandList = helper.getBrandList()
    return { brands: brandList }
}

export default function (data) {
    group('View brands list', () => {
        let res = http.get(__ENV.HOST + '/brands', {
            headers: {
                "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/62.0.3183.0 Safari/537.36"
            }
        })

        let check = globalChecks(res, duration)
        BrandsFailRate.add(!check)
        BrandsDuration.add(res.timings.duration)
        BrandsReqs.add(1)

        sleep(1)
    })

    group('View brand page', () => {
        let random = Math.floor(Math.random() * data.brands.length)

        let res = http.get(__ENV.HOST + config.api.brands + data.brands[random].id, {
            headers: {
                "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/62.0.3183.0 Safari/537.36"
            }
        })
        res.body = JSON.parse(res.body)

        let view = http.get(__ENV.HOST + '/brands/' + data.brands[random].id, {
            headers: {
                "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/62.0.3183.0 Safari/537.36"
            }
        })

        if (res.body.products.length == 0) {
            let check = globalChecks(view, duration)
            BrandNoProductFailRate.add(!check)
            BrandNoProductDuration.add(view.timings.duration)
            BrandNoProductReqs.add(1)
            console.log('View brand: ' + res.body.slug + ' (no product)')
        } else {
            let check = globalChecks(view, duration)
            BrandWithProductFailRate.add(!check)
            BrandWithProductDuration.add(view.timings.duration)
            BrandWithProductReqs.add(1)
            console.log('View brand: ' + res.body.slug + ' (with products)')
        }

        sleep(1)
    })
}