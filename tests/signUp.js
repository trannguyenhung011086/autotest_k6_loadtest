import { config, globalChecks } from '../common/index.js'
import http from 'k6/http'
import { sleep } from 'k6'
import { Trend, Rate, Counter } from 'k6/metrics'
import faker from 'cdnjs.com/libraries/Faker'

export let SignUpDuration = new Trend('Sign up Duration')
export let SignUpFailRate = new Rate('Sign up Fail Rate')
export let SignUpReqs = new Counter('Sign up Requests')

let duration = 1000
let rate = 0.1

export let options = {
    thresholds: {
        'Sign up Duration': [`p(95)<${duration}`],
        'Sign up Fail Rate': [`rate<${rate}`]
    }
}

export function setup() {
    let res = http.post(__ENV.HOST + config.api.signIn, {
        "email": config.testAccount.email, "password": config.testAccount.password
    })
    return { cookies: JSON.stringify(res.cookies) }
}

export default function () {
    let jar = http.cookieJar()
    jar.set(__ENV.HOST, 'leflair.connect.sid', JSON.parse(data.cookies)['leflair.connect.sid'][0].value)

    let res = http.post(__ENV.HOST + config.api.signUp, {
        "email": 'QA_TECH_' + faker.internet.email(),
        "password": faker.internet.password(),
        "language": "vn", "gender": "M"
    })

    let checkRes = globalChecks(res, duration)
    
    SignUpFailRate.add(!checkRes)
    SignUpDuration.add(res.timings.duration)
    SignUpReqs.add(1)

    sleep(1)
}