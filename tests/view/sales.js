// import { config, Helper } from '../../common/index.js'
import { config } from '../../common/config.js'
import * as helper from '../../common/helper.js'
import http from 'k6/http'
import { sleep, group } from 'k6'
import { Trend, Rate, Counter } from 'k6/metrics'

export let ViewOngoingSaleDuration = new Trend('View ongoing sale Duration')
export let ViewUpcomingSaleDuration = new Trend('View upcoming sale Duration')

export let ViewOngoingSaleFailRate = new Rate('View ongoing sale Fail Rate')
export let ViewUpcomingSaleFailRate = new Rate('View upcoming sale Fail Rate')

export let ViewOngoingSaleReqs = new Counter('View ongoing sale Requests')
export let ViewUpcomingSaleReqs = new Counter('View upcoming sale Requests')

let duration = 3000
let rate = 0.05

export let options = {
    thresholds: {
        'View ongoing sale Duration': [`p(95)<${duration}`],
        'View ongoing sale Fail Rate': [`rate<${rate}`],
        'View upcoming sale Duration': [`p(95)<${duration}`],
        'View upcoming sale Fail Rate': [`rate<${rate}`]
    }
}

export function setup() {
    let saleList = helper.getSales()
    return { sales: saleList }
}

export default function (data) {
    group('View ongoing sale', () => {
        let sales = JSON.parse(data.sales.ongoing)
        let random = Math.floor(Math.random() * sales.length)

        let res = http.get(__ENV.HOST + '/sales/' + sales[random].id, {
            headers: {
                "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/62.0.3183.0 Safari/537.36"
            }
        })
        console.log('View ongoing sale: ' + sales[random].slug)

        let check = helper.globalChecks(res, duration)
        ViewOngoingSaleFailRate.add(!check)
        ViewOngoingSaleDuration.add(res.timings.duration)
        ViewOngoingSaleReqs.add(1)

        sleep(1)
    })

    group('View upcoming sale', () => {
        let dates = JSON.parse(data.sales.upcoming)
        let random = Math.floor(Math.random() * dates[0].sales.length)

        let res = http.get(__ENV.HOST + '/sales/upcoming/' + dates[0].sales[random].id)
        console.log('View upcoming sale: ' + dates[0].sales[random].slug)

        let check = helper.globalChecks(res, duration)
        ViewUpcomingSaleFailRate.add(!check)
        ViewUpcomingSaleDuration.add(res.timings.duration)
        ViewUpcomingSaleReqs.add(1)

        sleep(1)
    })
}