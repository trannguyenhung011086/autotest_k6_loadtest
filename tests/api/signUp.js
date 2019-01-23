import { config, globalChecks } from '../../common/index.js'
import http from 'k6/http'
import { sleep } from 'k6'
import { Trend, Rate, Counter } from 'k6/metrics'
import faker from 'cdnjs.com/libraries/Faker'

export let SignUpDuration = new Trend('Sign up Duration')
export let SignUpFailRate = new Rate('Sign up Fail Rate')
export let SignUpReqs = new Counter('Sign up Requests')

let duration = 1000
let rate = 0.05

export let options = {
    thresholds: {
        'Sign up Duration': [`p(95)<${duration}`],
        'Sign up Fail Rate': [`rate<${rate}`]
    }
}

export default function () {
    let res = http.post(__ENV.HOST + config.api.signUp, {
        "email": 'QA_TECH_' + faker.internet.email(),
        "password": faker.internet.password(),
        "language": "vn", "gender": "M"
    })

    let check = globalChecks(res, duration)
    SignUpFailRate.add(!check)
    SignUpDuration.add(res.timings.duration)
    SignUpReqs.add(1)

    sleep(1)
}