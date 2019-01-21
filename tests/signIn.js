import { config, globalChecks } from '../common/index.js'
import http from 'k6/http'
import { sleep } from 'k6'
import { Trend, Rate, Counter } from 'k6/metrics'

export let SignInDuration = new Trend('Sign in Duration')
export let SignInChecks = new Rate('Sign in Checks')
export let SignInReqs = new Counter('Sign in Requests')

let duration = 500
let rate = 0.05

export let options = {
    thresholds: {
        'Sign in Duration': [`p(95)<${duration}`],
        'Sign in Checks': [`rate<${rate}`]
    }
}

const users = JSON.parse(open('../common/users.json'))

export default function () {
    for (let user of users) {
        let res = http.post(__ENV.HOST + config.api.signIn, {
            "email": user.email, "password": user.password
        })

        let checkRes = globalChecks(res, duration)
        
        SignInChecks.add(!checkRes)
        SignInDuration.add(res.timings.duration)
        SignInReqs.add(1)
    }

    sleep(1)
}