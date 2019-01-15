import config from '../common/config.js'
import http from "k6/http"
import { check, sleep } from "k6"

export let options = {
    vus: 10,
    duration: '30s'
}

export default function () {
    let res = http.get(__ENV.HOST + config.api.bestSellers)

    check(res, {
        'status is 200': res => res.status == 200,
        'transaction time is less than 500ms': res => res.timings.duration < 500
    })

    sleep(1)
}