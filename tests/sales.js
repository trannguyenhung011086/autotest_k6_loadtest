import { config, globalChecks } from '../common/index.js'
import * as helper from '../common/helper.js'
import http from 'k6/http'
import { sleep, group } from 'k6'
import { Trend, Rate, Counter } from 'k6/metrics'

export let GetOngoingSaleDuration = new Trend('Get ongoing sale Duration')
export let GetUpcomingSaleDuration = new Trend('Get upcoming sale Duration')

export let GetOngoingSaleFailRate = new Rate('Get ongoing sale Fail Rate')
export let GetUpcomingSaleFailRate = new Rate('Get upcoming sale Fail Rate')

export let GetOngoingSaleReqs = new Counter('Get ongoing sale Requests')
export let GetUpcomingSaleReqs = new Counter('Get upcoming sale Requests')

let duration = 300
let rate = 0.1

export let options = {
    thresholds: {
        'Get ongoing sale Duration': [`p(95)<${duration}`],
        'Get ongoing sale Fail Rate': [`rate<${rate}`],
        'Get upcoming sale Duration': [`p(95)<${duration}`],
        'Get upcoming sale Fail Rate': [`rate<${rate}`]
    }
}

export function setup() {
    let saleList = helper.getSales()
    return { sales: saleList }
}

export default function (data) {
    group('GET / get ongoing sale API', () => {
        let sales = JSON.parse(data.sales.ongoing)
        let random = Math.floor(Math.random() * sales.length)

        let res = http.get(__ENV.HOST + config.api.sales + sales[random].id)
        console.log('ongoing sale: ' + sales[random].title + ' ' + sales[random].id)

        let checkRes = globalChecks(res, duration)

        GetOngoingSaleFailRate.add(!checkRes)
        GetOngoingSaleDuration.add(res.timings.duration)
        GetOngoingSaleReqs.add(1)

        sleep(1)
    })

    group('GET / get upcoming sale API', () => {
        let dates = JSON.parse(data.sales.upcoming)
        let random = Math.floor(Math.random() * dates[0].sales.length)

        let res = http.get(__ENV.HOST + config.api.upcomingSale + dates[0].sales[random].id)
        console.log('upcoming sale: ' + dates[0].sales[random].title + ' ' + dates[0].sales[random].id)

        let checkRes = globalChecks(res, duration)

        GetUpcomingSaleFailRate.add(!checkRes)
        GetUpcomingSaleDuration.add(res.timings.duration)
        GetUpcomingSaleReqs.add(1)

        sleep(1)
    })
}