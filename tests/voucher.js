import config from '../common/config.js'
import http from 'k6/http'
import { check, sleep, group } from 'k6'
import { Trend, Rate, Counter } from 'k6/metrics'

export let ValidVoucherDuration = new Trend('Check valid voucher Duration')
export let InvalidVoucherDuration = new Trend('Check invalid voucher Duration')

export let ValidVoucherChecks = new Rate('Check valid voucher Checks')
export let InvalidVoucherChecks = new Rate('Check invalid voucher Checks')

export let ValidVoucherReqs = new Counter('Check valid voucher Requests')
export let InvalidVoucherReqs = new Counter('Check invalid voucher Requests')

let duration = 200
export let options = {
    vus: 10,
    duration: '30s',
    thresholds: {
        'Check valid voucher Duration': [`p(95)<${duration}`],
        'Check invalid voucher Duration': [`p(95)<${duration}`]
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

    group('GET / check valid voucher API', () => {
        let res = http.get(__ENV.HOST + config.api.voucher + 'ABBANK')

        check(res, {
            'status is OK': res => res.status == 200,
            'transaction time is less than threshold': res => res.timings.duration < duration
        }) || ValidVoucherChecks.add(1)
        ValidVoucherDuration.add(res.timings.duration)
        ValidVoucherReqs.add(1)

        sleep(1)
    })

    group('GET / check invalid voucher API', () => {
        let res = http.get(__ENV.HOST + config.api.voucher + 'INVALID-ID')

        check(res, {
            'status is not OK': res => res.status == 400,
            'transaction time is less than threshold': res => res.timings.duration < duration
        }) || InvalidVoucherChecks.add(1)
        InvalidVoucherDuration.add(res.timings.duration)
        InvalidVoucherReqs.add(1)

        sleep(1)
    })
}