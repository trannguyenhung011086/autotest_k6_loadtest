import config from '../config.js'
import http from "k6/http"
import { check, sleep } from "k6"
import faker from "cdnjs.com/libraries/Faker"

export let options = {
    vus: 10,
    duration: '30s'
}

export default function () {
    let res = http.post(__ENV.HOST + config.api.signUp, {
        "email": faker.internet.email(), "password": faker.internet.password(),
        "language": "vn", "gender": "M"
    })

    check(res, {
        'status is 200': res => res.status == 200,
        'transaction time is less than 500ms': res => res.timings.duration < 500
    })

    sleep(1)
}