import config from '../common/config.js'
import http from 'k6/http'
import { check, sleep } from 'k6'
import { Trend } from 'k6/metrics'
import faker from "cdnjs.com/libraries/Faker"

export let SignUpDuration = new Trend('Sign up Duration')

export let options = {
    vus: 10,
    duration: '30s',
    thresholds: {
        'Sign up Duration': ['p(95)<1000']
    }
}

export default function () {
    let res = http.post(__ENV.HOST + config.api.signUp, {
        "email": faker.internet.email(), "password": faker.internet.password(),
        "language": "vn", "gender": "M"
    })

    check(res, {
        'status is 200': res => res.status == 200,
        'transaction time is less than 500ms': res => res.timings.duration < 1000
    })
    SignUpDuration.add(res.timings.duration)

    sleep(1)
}