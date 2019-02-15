// import { config, Helper } from '../../common/index.js'
import { config } from '../../common/config.js'
import * as helper from '../../common/helper.js'
import http from 'k6/http'
import { sleep, group } from 'k6'
import { Trend, Rate, Counter } from 'k6/metrics'
import faker from 'cdnjs.com/libraries/Faker'

export let GetAccountDuration = new Trend('Account - Get info Duration')
export let UpdateAccountDuration = new Trend('Account - Update  info Duration')

export let GetAccountFailRate = new Rate('Account - Get info Fail Rate')
export let UpdateAccountFailRate = new Rate('Account - Update  info Fail Rate')

export let GetAccountReqs = new Counter('Account - Get info Requests')
export let UpdateAccountReqs = new Counter('Account - Update  info Requests')

let duration = 500
let rate = 0.05

export let options = {
    thresholds: {
        'Account - Get info Duration': [`p(95)<${duration}`],
        'Account - Get info Fail Rate': [`rate<${rate}`],
        'Account - Update  info Duration': [`p(95)<${duration}`],
        'Account - Update  info Fail Rate': [`rate<${rate}`]
    }
}

export function setup() {
    let userCookies = helper.getCookies()
    return { cookies: userCookies }
}

export default function (data) {
    let jar = http.cookieJar()
    jar.set(__ENV.HOST, 'leflair.connect.sid',
        JSON.parse(data.cookies)['leflair.connect2.sid'][0].value)

    group('GET / Account - Get info API', () => {
        let res = http.get(__ENV.HOST + config.api.account)

        let check = helper.globalChecks(res, duration)
        GetAccountFailRate.add(!check)
        GetAccountDuration.add(res.timings.duration)
        GetAccountReqs.add(1)

        sleep(1)
    })

    group('PUT / Account - Update  info API', () => {
        let body = JSON.stringify({
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName()
        })
        let res = http.put(__ENV.HOST + config.api.account, body,
            { headers: { "Content-Type": "application/json" } })

        let check = helper.globalChecks(res, duration)
        UpdateAccountFailRate.add(!check)
        UpdateAccountDuration.add(res.timings.duration)
        UpdateAccountReqs.add(1)

        sleep(1)
    })
}