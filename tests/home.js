import config from '../config.js'
import http from "k6/http"
import { check, sleep, group } from "k6"

export let options = {
    vus: 10,
    duration: '30s'
}

export default function () {
    group('GET / home API', () => {
        let res = http.get(__ENV.HOST + config.api.home)

        check(res, {
            'status is 200': res => res.status == 200,
            'transaction time is less than 500ms': res => res.timings.duration < 500
        })

        sleep(1)
    })

    group('GET / today sales', () => {
        let res = http.get(__ENV.HOST + config.api.todaySales)

        check(res, {
            'status is 200': res => res.status == 200,
            'transaction time is less than 500ms': res => res.timings.duration < 500
        })

        sleep(1)
    })

    group('GET / current sales', () => {
        let res = http.get(__ENV.HOST + config.api.currentSales)

        check(res, {
            'status is 200': res => res.status == 200,
            'transaction time is less than 500ms': res => res.timings.duration < 500
        })

        sleep(1)
    })

    group('GET / featured sales', () => {
        let res = http.get(__ENV.HOST + config.api.featuredSales)

        check(res, {
            'status is 200': res => res.status == 200,
            'transaction time is less than 500ms': res => res.timings.duration < 500
        })

        sleep(1)
    })

    group('GET / international sales', () => {
        let res = http.get(__ENV.HOST + config.api.internationalSales)

        check(res, {
            'status is 200': res => res.status == 200,
            'transaction time is less than 500ms': res => res.timings.duration < 500
        })

        sleep(1)
    })

    group('GET / POTD sales', () => {
        let res = http.get(__ENV.HOST + config.api.potdSales)

        check(res, {
            'status is 200': res => res.status == 200,
            'transaction time is less than 500ms': res => res.timings.duration < 500
        })

        sleep(1)
    })
}