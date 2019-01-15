import config from '../common/config.js'
import http from 'k6/http'
import { check, sleep } from 'k6'
import { Trend } from 'k6/metrics'

export let BestSellersDuration = new Trend('Best sellers Duration')

export let options = {
    vus: 10,
    duration: '30s',
    thresholds: {
        'Best sellers Duration': ['p(95)<500']
    }
}

export default function () {
    let res = http.get(__ENV.HOST + config.api.bestSellers)

    check(res, {
        'status is 200': res => res.status == 200,
        'transaction time is less than 500ms': res => res.timings.duration < 500
    })
    BestSellersDuration.add(res.timings.duration)

    sleep(1)
}