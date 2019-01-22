import { config, globalChecks } from '../common/index.js'
import http from 'k6/http'
import { sleep } from 'k6'
import { Trend, Rate, Counter } from 'k6/metrics'

export let BestSellersDuration = new Trend('Best sellers Duration')
export let BestSellersFailRate = new Rate('Best sellers Fail Rate')
export let BestSellersReqs = new Counter('Best sellers Requests')

let duration = 500
let rate = 0.1

export let options = {
    thresholds: {
        'Best sellers Duration': [`p(95)<${duration}`],
        'Best sellers Fail Rate': [`rate<${rate}`]
    }
}

export default function () {
    let res = http.get(__ENV.HOST + config.api.bestSellers)

    globalChecks(res, duration) || BestSellersFailRate.add(1)
    BestSellersDuration.add(res.timings.duration)
    BestSellersReqs.add(1)
    
    sleep(1)
}