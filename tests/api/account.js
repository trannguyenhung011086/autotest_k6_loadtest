import { config, globalChecks } from '../../common/index.js'
import * as helper from '../../common/helper.js'
import http from 'k6/http'
import { sleep, group } from 'k6'
import { Trend, Rate, Counter } from 'k6/metrics'
import faker from 'cdnjs.com/libraries/Faker'

export let GetAccountDuration = new Trend('Get account Duration')
export let UpdateAccountDuration = new Trend('Update account Duration')

export let GetAccountFailRate = new Rate('Get account Fail Rate')
export let UpdateAccountFailRate = new Rate('Update account Fail Rate')

export let GetAccountReqs = new Counter('Get account Requests')
export let UpdateAccountReqs = new Counter('Update account Requests')

let duration = 500
let rate = 0.05

export let options = {
    thresholds: {
        'Get account Duration': [`p(95)<${duration}`],
        'Get account Fail Rate': [`rate<${rate}`],
        'Update account Duration': [`p(95)<${duration}`],
        'Update account Fail Rate': [`rate<${rate}`]
    }
}

export function setup() {
    let userCookies = helper.getCookies()
    return { cookies: userCookies }
}

export default function (data) {
    let jar = http.cookieJar()
    jar.set(__ENV.HOST, 'leflair.connect.sid', JSON.parse(data.cookies)['leflair.connect.sid'][0].value)

    group('GET / get account API', () => {
        let res = http.get(__ENV.HOST + config.api.account)

        let check = globalChecks(res, duration)
        GetAccountFailRate.add(!check)
        GetAccountDuration.add(res.timings.duration)
        GetAccountReqs.add(1)

        sleep(1)
    })

    group('PUT / update account API', () => {
        let body = JSON.stringify({
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName()
        })
        let res = http.put(__ENV.HOST + config.api.account, body,
            { headers: { "Content-Type": "application/json" } })

        let check = globalChecks(res, duration)
        UpdateAccountFailRate.add(!check)
        UpdateAccountDuration.add(res.timings.duration)
        UpdateAccountReqs.add(1)

        sleep(1)
    })
}