import config from '../common/config.js'
import http from 'k6/http'
import { check, sleep } from 'k6'
import { Trend } from 'k6/metrics'

export let AccountDuration = new Trend('Account Duration')

export let options = {
    vus: 10,
    duration: '30s',
    thresholds: {
        'Account Duration': ['p(95)<500']
    }
}

export function setup() {
    let res = http.post(__ENV.HOST + config.api.signIn, {
        "email": config.testAccount.email, "password": config.testAccount.password
    })
    return JSON.stringify(res.cookies)
}

export default function (data) {
    let jar = http.cookieJar()
    jar.set(__ENV.HOST, 'leflair.connect.sid', JSON.parse(data)['leflair.connect.sid'][0].value)

    let res = http.get(__ENV.HOST + config.api.account)

    check(res, {
        'status is 200': res => res.status == 200,
        'transaction time is less than 500ms': res => res.timings.duration < 500
    })
    AccountDuration.add(res.timings.duration)

    sleep(1)
}