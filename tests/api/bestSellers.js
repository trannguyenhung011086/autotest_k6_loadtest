// import { config, Helper } from '../../common/index.js'
import { config } from '../../common/config.js'
import * as helper from '../../common/helper.js'
import http from 'k6/http'
import { sleep } from 'k6'
import { Trend, Rate, Counter } from 'k6/metrics'

export let BestSellersDuration = new Trend('Get best sellers Duration')
export let BestSellersFailRate = new Rate('Get best sellers Fail Rate')
export let BestSellersReqs = new Counter('Get best sellers Requests')

let duration = 300
let rate = 0.05

export let options = {
    thresholds: {
        'Get best sellers Duration': [`p(95)<${duration}`],
        'Get best sellers Fail Rate': [`rate<${rate}`]
    }
}

export default function () {
    let res = http.get(__ENV.HOST + config.api.bestSellers)

    let check = helper.globalChecks(res, duration)
    BestSellersFailRate.add(!check)
    BestSellersDuration.add(res.timings.duration)
    BestSellersReqs.add(1)
    
    sleep(1)
}