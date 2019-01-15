import config from '../config.js'
import http from "k6/http"
import { check, sleep } from "k6"

export let options = {
    vus: 10,
    duration: '30s'
}

const users = JSON.parse(open('../common/users.json'))

export default function () {
    for (let i = 0; i < users.length; i++) {
        let res = http.post(__ENV.HOST + config.api.signIn, {
            "email": users[i].email, "password": users[i].password
        })

        check(res, {
            'status is 200': res => res.status == 200,
            'transaction time is less than 500ms': res => res.timings.duration < 500
        })
    }

    sleep(1)
}