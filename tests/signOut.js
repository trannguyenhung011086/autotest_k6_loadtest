import { config, globalChecks } from '../common/index.js'
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

const users = JSON.parse(open('../common/users.json'))

export default function () {
    for (let user of users) {
        let res = http.post(__ENV.HOST + config.api.signOut, {
            "email": user.email, "password": user.password
        })

        let checkRes = globalChecks(res, duration)
        
        SignOutFailRate.add(!checkRes)
        SignOutDuration.add(res.timings.duration)
        SignOutReqs.add(1)
    }

    sleep(1)
}