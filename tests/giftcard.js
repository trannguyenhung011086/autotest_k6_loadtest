import { config, globalChecks } from '../common/index.js'
import http from 'k6/http'
import { sleep, group } from 'k6'
import { Trend, Rate, Counter } from 'k6/metrics'

export let ValidGiftCardDuration = new Trend('Check valid gift card Duration')
export let InvalidGiftCardDuration = new Trend('Check invalid gift card Duration')

export let ValidGiftCardChecks = new Rate('Check valid gift card Checks')
export let InvalidGiftCardChecks = new Rate('Check invalid gift card Checks')

export let ValidGiftCardReqs = new Counter('Check valid gift card Requests')
export let InvalidGiftCardReqs = new Counter('Check invalid gift card Requests')

let duration = 100
export let options = {
    vus: 10,
    duration: '30s',
    thresholds: {
        'Check valid gift card Duration': [`p(95)<${duration}`],
        'Check invalid gift card Duration': [`p(95)<${duration}`]
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

    group('GET / check valid gift card API', () => {
        let res = http.get(__ENV.HOST + config.api.giftcard + '4TZACVS')

        globalChecks(res, duration) || ValidGiftCardChecks.add(1)
        ValidGiftCardDuration.add(res.timings.duration)
        ValidGiftCardReqs.add(1)

        sleep(1)
    })

    group('GET / check invalid gift card API', () => {
        let res = http.get(__ENV.HOST + config.api.giftcard + 'INVALID-ID')

        globalChecks(res, duration, 500) || InvalidGiftCardChecks.add(1)
        InvalidGiftCardDuration.add(res.timings.duration)
        InvalidGiftCardReqs.add(1)

        sleep(1)
    })
}