import { config, globalChecks } from '../common/index.js'
import http from 'k6/http'
import { sleep } from 'k6'
import { Trend, Rate, Counter } from 'k6/metrics'

export let SignOutDuration = new Trend('Sign out Duration')
export let SignOutChecks = new Rate('Sign out Checks')
export let SignOutReqs = new Counter('Sign out Requests')

let duration = 500
export let options = {
    vus: 10,
    duration: '30s',
    thresholds: {
        'Sign out Duration': [`p(95)<${duration}`]
    }
}

const users = JSON.parse(open('../common/users.json'))

export default function () {
    for (let user of users) {
        let res = http.post(__ENV.HOST + config.api.signOut, {
            "email": user.email, "password": user.password
        })

        globalChecks(res, duration) || SignOutChecks.add(1)
        SignOutDuration.add(res.timings.duration)
        SignOutReqs.add(1)
    }

    sleep(1)
}