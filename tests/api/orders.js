import { config, globalChecks } from '../../common/index.js'
import * as helper from '../../common/helper.js'
import http from 'k6/http'
import { sleep, group } from 'k6'
import { Trend, Rate, Counter } from 'k6/metrics'

export let GetOrdersDuration = new Trend('Get all orders Duration')
export let GetOrderDuration = new Trend('Get order info Duration')

export let GetOrdersFailRate = new Rate('Get all orders Fail Rate')
export let GetOrderFailRate = new Rate('Get order info Fail Rate')

export let GetOrdersReqs = new Counter('Get all orders Requests')
export let GetOrderReqs = new Counter('Get order info Requests')

let duration = 500
let rate = 0.05

export let options = {
    thresholds: {
        'Get all orders Duration': [`p(95)<${duration}`],
        'Get all orders Fail Rate': [`rate<${rate}`],
        'Get order info Duration': [`p(95)<${duration}`],
        'Get order info Fail Rate': [`rate<${rate}`]
    }
}

export function setup() {
    let userCookies = helper.getCookies()
    let userOrders = helper.getOrders()
    return {
        cookies: userCookies,
        orders: userOrders
    }
}

export default function (data) {
    let jar = http.cookieJar()
    jar.set(__ENV.HOST, 'leflair.connect.sid', JSON.parse(data.cookies)['leflair.connect.sid'][0].value)

    group('GET / Get all orders API', () => {
        let res = http.get(__ENV.HOST + config.api.orders)

        let check = globalChecks(res, duration)
        GetOrdersFailRate.add(!check)
        GetOrdersDuration.add(res.timings.duration)
        GetOrdersReqs.add(1)

        sleep(1)
    })

    group('GET / Get order info API', () => {
        let orders = JSON.parse(data.orders)
        let random = Math.floor(Math.random() * orders.length)

        let res = http.get(__ENV.HOST + config.api.orders + '/' + orders[random].id)

        let check = globalChecks(res, duration)
        GetOrderFailRate.add(!check)
        GetOrderDuration.add(res.timings.duration)
        GetOrderReqs.add(1)

        sleep(1)
    })
}