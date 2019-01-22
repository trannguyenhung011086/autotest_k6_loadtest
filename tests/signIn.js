import { config, globalChecks } from '../common/index.js'
import http from 'k6/http'
import { sleep } from 'k6'
import { Trend, Rate, Counter } from 'k6/metrics'

export let SignInDuration = new Trend('Sign in Duration')
export let SignInFailRate = new Rate('Sign in Fail Rate')
export let SignInReqs = new Counter('Sign in Requests')

let duration = 500
let rate = 0.1

export let options = {
    thresholds: {
        'Sign in Duration': [`p(95)<${duration}`],
        'Sign in Fail Rate': [`rate<${rate}`]
    }
}

const users = JSON.parse(open('../common/users.json'))

export default function () {
    for (let user of users) {
        let res = http.post(__ENV.HOST + config.api.signIn, {
            "email": user.email, "password": user.password
        })

        globalChecks(res, duration) || SignInFailRate.add(1)
        SignInDuration.add(res.timings.duration)
        SignInReqs.add(1)
    }

    sleep(1)
}