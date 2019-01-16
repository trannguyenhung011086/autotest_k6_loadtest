import config from '../common/config.js'
import http from 'k6/http'
import { check, sleep } from 'k6'
import { Trend } from 'k6/metrics'

export let SignInDuration = new Trend('Sign in Duration')

export let options = {
    vus: 10,
    duration: '30s',
    thresholds: {
        'Sign in Duration': ['p(95)<500']
    }
}

const users = JSON.parse(open('../common/users.json'))

export default function () {
    for (let user of users) {
        let res = http.post(__ENV.HOST + config.api.signIn, {
            "email": user.email, "password": user.password
        })

        check(res, {
            'status is 200': res => res.status == 200,
            'transaction time is less than 500ms': res => res.timings.duration < 500
        })
        SignInDuration.add(res.timings.duration)
    }

    sleep(1)
}