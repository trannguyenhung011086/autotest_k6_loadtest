import { config, globalChecks } from '../common/index.js'
import http from 'k6/http'
import { sleep, group } from 'k6'
import { Trend, Rate, Counter } from 'k6/metrics'

export let ValidGiftCardDuration = new Trend('Check valid gift card Duration')
export let InvalidGiftCardDuration = new Trend('Check invalid gift card Duration')

export let ValidGiftCardFailRate = new Rate('Check valid gift card Fail Rate')
export let InvalidGiftCardFailRate = new Rate('Check invalid gift card Fail Rate')

export let ValidGiftCardReqs = new Counter('Check valid gift card Requests')
export let InvalidGiftCardReqs = new Counter('Check invalid gift card Requests')

let duration = 100
let rate = 0.1

export let options = {
    thresholds: {
        'Check valid gift card Duration': [`p(95)<${duration}`],
        'Check valid gift card Fail Rate': [`rate<${rate}`],
        'Check invalid gift card Duration': [`p(95)<${duration}`],
        'Check invalid gift card Fail Rate': [`rate<${rate}`]
    }
}

export function setup() {
    let res = http.post(__ENV.HOST + config.api.signIn, {
        "email": config.testAccount.email, "password": config.testAccount.password
    })
    return { cookies: JSON.stringify(res.cookies) }
}

export default function (data) {
    let jar = http.cookieJar()
    jar.set(__ENV.HOST, 'leflair.connect.sid', JSON.parse(data.cookies)['leflair.connect.sid'][0].value)

    group('GET / check valid gift card API', () => {
        let res = http.get(__ENV.HOST + config.api.giftcard + '4TZACVS')

        let checkRes = globalChecks(res, duration)

        ValidGiftCardFailRate.add(!checkRes)
        ValidGiftCardDuration.add(res.timings.duration)
        ValidGiftCardReqs.add(1)

        sleep(1)
    })

    group('GET / check invalid gift card API', () => {
        let res = http.get(__ENV.HOST + config.api.giftcard + 'INVALID-ID')

        let checkRes = globalChecks(res, duration, 500)

        InvalidGiftCardFailRate.add(!checkRes)
        InvalidGiftCardDuration.add(res.timings.duration)
        InvalidGiftCardReqs.add(1)

        sleep(1)
    })
}