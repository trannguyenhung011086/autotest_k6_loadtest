// import { config, Helper } from '../../common/index.js'
import { config } from '../../common/config.js'
import * as helper from '../../common/helper.js'
import http from 'k6/http'
import { sleep, group } from 'k6'
import { Trend, Rate, Counter } from 'k6/metrics'

export let ValidGiftCardDuration = new Trend('Gift card - Check valid Duration')
export let InvalidGiftCardDuration = new Trend('Gift card - Check invalid Duration')

export let ValidGiftCardFailRate = new Rate('Gift card - Check valid Fail Rate')
export let InvalidGiftCardFailRate = new Rate('Gift card - Check invalid Fail Rate')

export let ValidGiftCardReqs = new Counter('Gift card - Check valid Requests')
export let InvalidGiftCardReqs = new Counter('Gift card - Check invalid Requests')

let duration = 100
let rate = 0.05

export let options = {
    thresholds: {
        'Gift card - Check valid Duration': [`p(95)<${duration}`],
        'Gift card - Check valid Fail Rate': [`rate<${rate}`],
        'Gift card - Check invalid Duration': [`p(95)<${duration}`],
        'Gift card - Check invalid Fail Rate': [`rate<${rate}`]
    }
}

export function setup() {
    let userCookies = helper.getCookies()
    return { cookies: userCookies }
}

export default function (data) {
    let jar = http.cookieJar()
    jar.set(__ENV.HOST, 'leflair.connect.sid', JSON.parse(data.cookies)['leflair.connect.sid'][0].value)

    group('GET / Gift card - Check valid API', () => {
        let res = http.get(__ENV.HOST + config.api.giftcard + '4TZACVS')

        let check = helper.globalChecks(res, duration)
        ValidGiftCardFailRate.add(!check)
        ValidGiftCardDuration.add(res.timings.duration)
        ValidGiftCardReqs.add(1)

        sleep(1)
    })

    group('GET / Gift card - Check invalid API', () => {
        let res = http.get(__ENV.HOST + config.api.giftcard + 'INVALID-ID')

        let check = helper.globalChecks(res, duration, 500)
        InvalidGiftCardFailRate.add(!check)
        InvalidGiftCardDuration.add(res.timings.duration)
        InvalidGiftCardReqs.add(1)

        sleep(1)
    })
}