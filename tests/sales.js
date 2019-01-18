import { config, globalChecks } from '../common/index.js'
import http from 'k6/http'
import { sleep, group } from 'k6'
import { Trend, Rate, Counter } from 'k6/metrics'

export let GetOngoingSaleDuration = new Trend('Get ongoing sale Duration')
export let GetUpcomingSaleDuration = new Trend('Get upcoming sale Duration')

export let GetOngoingSaleChecks = new Rate('Get ongoing sale Checks')
export let GetUpcomingSaleChecks = new Rate('Get upcoming sale Checks')

export let GetOngoingSaleReqs = new Counter('Get ongoing sale Requests')
export let GetUpcomingSaleReqs = new Counter('Get upcoming sale Requests')

let duration = 300
export let options = {
    vus: 10,
    duration: '30s',
    thresholds: {
        'Get ongoing sale Duration': [`p(95)<${duration}`],
        'Get upcoming sale Duration': [`p(95)<${duration}`]
    }
}

export function setup() {
    let requests = {
        'ongoing': __ENV.HOST + config.api.currentSales,
        'upcoming': __ENV.HOST + config.api.upcomingSales
    }
    let res = http.batch(requests)

    return {
        ongoing: res['ongoing'].body,
        upcoming: res['upcoming'].body
    }
}

export default function (data) {
    group('GET / get ongoing sale API', () => {
        let sales = JSON.parse(data.ongoing)
        let random = Math.floor(Math.random() * sales.length)

        let res = http.get(__ENV.HOST + config.api.sales + sales[random].id)
        console.log('ongoing sale: ' + sales[random].title + ' ' + sales[random].id)

        globalChecks(res, duration) || GetOngoingSaleChecks.add(1)
        GetOngoingSaleDuration.add(res.timings.duration)
        GetOngoingSaleReqs.add(1)

        sleep(1)
    })

    group('GET / get upcoming sale API', () => {
        let dates = JSON.parse(data.upcoming)
        let random = Math.floor(Math.random() * dates[0].sales.length)

        let res = http.get(__ENV.HOST + config.api.upcomingSale + dates[0].sales[random].id)
        console.log('upcoming sale: ' + dates[0].sales[random].title + ' ' + dates[0].sales[random].id)

        globalChecks(res, duration) || GetUpcomingSaleChecks.add(1)
        GetUpcomingSaleDuration.add(res.timings.duration)
        GetUpcomingSaleReqs.add(1)

        sleep(1)
    })
}