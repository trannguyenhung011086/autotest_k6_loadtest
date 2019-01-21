import { config, globalChecks } from '../common/index.js'
import * as helper from '../common/helper.js'
import http from 'k6/http'
import { sleep } from 'k6'
import { Trend, Rate, Counter } from 'k6/metrics'

export let SignOutDuration = new Trend('Sign out Duration')
export let SignOutFailRate = new Rate('Sign out Fail Rate')
export let SignOutReqs = new Counter('Sign out Requests')

let duration = 500
let rate = 0.1

export let options = {
    thresholds: {
        'Sign out Duration': [`p(95)<${duration}`],
        'Sign out Fail Rate': [`rate<${rate}`]
    }
}

export function setup() {
    let userCookies = helper.getCookies()
    return { cookies: userCookies }
}

export default function () {
    let jar = http.cookieJar()
    jar.set(__ENV.HOST, 'leflair.connect.sid', JSON.parse(data.cookies)['leflair.connect.sid'][0].value)

    let res = http.get(__ENV.HOST + config.api.signOut)

    let checkRes = globalChecks(res, duration)

    SignOutFailRate.add(!checkRes)
    SignOutDuration.add(res.timings.duration)
    SignOutReqs.add(1)

    sleep(1)
}