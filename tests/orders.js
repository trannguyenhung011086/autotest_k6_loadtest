import { config, globalChecks } from '../common/index.js'
import http from 'k6/http'
import { sleep, group } from 'k6'
import { Trend, Rate, Counter } from 'k6/metrics'

export let GetOrdersDuration = new Trend('Get orders Duration')
export let GetOrderDuration = new Trend('Get an order Duration')

export let GetOrdersFailRate = new Rate('Get orders Fail Rate')
export let GetOrderFailRate = new Rate('Get an order Fail Rate')

export let GetOrdersReqs = new Counter('Get orders Requests')
export let GetOrderReqs = new Counter('Get an order Requests')

let duration = 500
let rate = 0.1

export let options = {
    thresholds: {
        'Get orders Duration': [`p(95)<${duration}`],
        'Get orders Fail Rate': [`rate<${rate}`],
        'Get an order Duration': [`p(95)<${duration}`],
        'Get an order Fail Rate': [`rate<${rate}`]
    }
}

export function setup() {
    let res = http.post(__ENV.HOST + config.api.signIn, {
        "email": config.testAccount.email, "password": config.testAccount.password
    })
    return { cookies: JSON.stringify(res.cookies) }
}

export default function (data) {
    let jar = http.cookieJar()
    jar.set(__ENV.HOST, 'leflair.connect.sid', JSON.parse(data.cookies)['leflair.connect.sid'][0].value)

    group('GET / get orders API', () => {
        let res = http.get(__ENV.HOST + config.api.orders)

        let checkRes = globalChecks(res, duration)
        
        GetOrdersFailRate.add(!checkRes)
        GetOrdersDuration.add(res.timings.duration)
        GetOrdersReqs.add(1)

        sleep(1)
    })

    group('GET / Get an order API', () => {
        let orders = http.get(__ENV.HOST + config.api.orders)

        for (let order of JSON.parse(orders.body)) {
            let res = http.get(__ENV.HOST + config.api.orders + '/' + order.id)

            let checkRes = globalChecks(res, duration)
            
            GetOrderFailRate.add(!checkRes)
            GetOrderDuration.add(res.timings.duration)
            GetOrderReqs.add(1)
        }

        sleep(1)
    })
}