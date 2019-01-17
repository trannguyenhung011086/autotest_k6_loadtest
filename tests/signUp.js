import config from '../common/config.js'
import http from 'k6/http'
import { check, sleep } from 'k6'
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

    check(res, {
        'status is OK': res => res.status == 200,
        'transaction time is less than threshold': res => res.timings.duration < duration
    })
    SignUpDuration.add(res.timings.duration)

    sleep(1)
}