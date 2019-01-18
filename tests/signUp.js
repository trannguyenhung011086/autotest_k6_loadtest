import { config, globalChecks } from '../common/index.js'
import http from 'k6/http'
import { sleep } from 'k6'
import { Trend } from 'k6/metrics'
import faker from 'cdnjs.com/libraries/Faker'

export let SignUpDuration = new Trend('Sign up Duration')

let duration = 1000
export let options = {
    vus: 10,
    duration: '30s',
    thresholds: {
        'Sign up Duration': [`p(95)<${duration}`]
    }
}

export default function () {
    let res = http.post(__ENV.HOST + config.api.signUp, {
        "email": 'QA_TECH_' + faker.internet.email(),
        "password": faker.internet.password(),
        "language": "vn", "gender": "M"
    })

    globalChecks(res, duration)
    SignUpDuration.add(res.timings.duration)

    sleep(1)
}