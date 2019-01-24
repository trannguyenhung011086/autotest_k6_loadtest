import { globalChecks } from '../../common/index.js'
import http from 'k6/http'
import { sleep } from 'k6'
import { Trend, Rate, Counter } from 'k6/metrics'

export let ViewHomeDuration = new Trend('View home Duration')
export let ViewHomeFailRate = new Rate('View home Fail Rate')
export let ViewHomeReqs = new Counter('View home Requests')

let duration = 3000
let rate = 0.05

export let options = {
    thresholds: {
        'View home Duration': [`p(95)<${duration}`],
        'View home Fail Rate': [`rate<${rate}`]
    }
}

export default function () {
    let res = http.get(__ENV.HOST)

    let check = globalChecks(res, duration)
    ViewHomeFailRate.add(!check)
    ViewHomeDuration.add(res.timings.duration)
    ViewHomeReqs.add(1)
    
    sleep(1)
}