import config from '../common/config.js'
import http from 'k6/http'
import { check, sleep } from 'k6'
import { Trend } from 'k6/metrics'

export let BestSellersDuration = new Trend('Best sellers Duration')

let duration = 500
export let options = {
    vus: 10,
    duration: '30s',
    thresholds: {
        'Best sellers Duration': [`p(95)<${duration}`]
    }
}

export default function () {
    let res = http.get(__ENV.HOST + config.api.bestSellers)

    check(res, {
        'status is OK': res => res.status == 200,
        'transaction time is less than threshold': res => res.timings.duration < duration
    })
    BestSellersDuration.add(res.timings.duration)

    sleep(1)
}