import config from '../common/config.js'
import http from 'k6/http'
import { check, sleep } from 'k6'
import { Trend } from 'k6/metrics'

export let BrandsDuration = new Trend('Brands Duration')

export let options = {
    vus: 10,
    duration: '30s',
    thresholds: {
        'Brands Duration': ['p(95)<500']
    }
}

export default function () {
    let res = http.get(__ENV.HOST + config.api.brands)

    check(res, {
        'status is 200': res => res.status == 200,
        'transaction time is less than 500ms': res => res.timings.duration < 500
    })
    BrandsDuration.add(res.timings.duration)

    sleep(1)
}