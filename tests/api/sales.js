import { config, globalChecks } from '../../common/index.js'
import * as helper from '../../common/helper.js'
import http from 'k6/http'
import { sleep, group } from 'k6'
import { Trend, Rate, Counter } from 'k6/metrics'

export let GetOngoingSaleDuration = new Trend('Get ongoing sale info Duration')
export let GetUpcomingSaleDuration = new Trend('Get upcoming sale info Duration')

export let GetOngoingSaleFailRate = new Rate('Get ongoing sale info Fail Rate')
export let GetUpcomingSaleFailRate = new Rate('Get upcoming sale info Fail Rate')

export let GetOngoingSaleReqs = new Counter('Get ongoing sale info Requests')
export let GetUpcomingSaleReqs = new Counter('Get upcoming sale info Requests')

let duration = 1000
let rate = 0.05

export let options = {
    thresholds: {
        'Get ongoing sale info Duration': [`p(95)<${duration}`],
        'Get ongoing sale info Fail Rate': [`rate<${rate}`],
        'Get upcoming sale info Duration': [`p(95)<${duration}`],
        'Get upcoming sale info Fail Rate': [`rate<${rate}`]
    }
}

export function setup() {
    let saleList = helper.getSales()
    return { sales: saleList }
}

export default function (data) {
    group('GET / Get ongoing sale info API', () => {
        let sales = JSON.parse(data.sales.ongoing)
        let random = Math.floor(Math.random() * sales.length)

        let res = http.get(__ENV.HOST + config.api.sales + sales[random].id)
        // console.log('ongoing sale: ' + sales[random].title + ' ' + sales[random].id)

        let check = globalChecks(res, duration)
        GetOngoingSaleFailRate.add(!check)
        GetOngoingSaleDuration.add(res.timings.duration)
        GetOngoingSaleReqs.add(1)

        sleep(1)
    })

    group('GET / Get upcoming sale info API', () => {
        let dates = JSON.parse(data.sales.upcoming)
        let random = Math.floor(Math.random() * dates[0].sales.length)

        let res = http.get(__ENV.HOST + config.api.upcomingSale + dates[0].sales[random].id)
        // console.log('upcoming sale: ' + dates[0].sales[random].title + ' ' + dates[0].sales[random].id)

        let check = globalChecks(res, duration)
        GetUpcomingSaleFailRate.add(!check)
        GetUpcomingSaleDuration.add(res.timings.duration)
        GetUpcomingSaleReqs.add(1)

        sleep(1)
    })
}