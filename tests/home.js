import config from '../common/config.js'
import http from "k6/http"
import { check, sleep, group } from "k6"
import { Trend, Rate, Counter } from "k6/metrics"

export let HomeChecks = new Rate('Home Checks')
export let TodayChecks = new Rate('Today sales Checks')
export let CurrentChecks = new Rate('Current sales Checks')
export let FeaturedChecks = new Rate('Featured sales Checks')
export let InternationalChecks = new Rate('International sales Checks')
export let PotdChecks = new Rate('POTD sales Checks')

export let HomeDuration = new Trend('Home Duration')
export let TodayDuration = new Trend('Today sales Duration')
export let CurrentDuration = new Trend('Current sales Duration')
export let FeaturedDuration = new Trend('Featured sales Duration')
export let InternationalDuration = new Trend('International sales Duration')
export let PotdDuration = new Trend('POTD sales Duration')

export let HomeReqs = new Counter('Home Requests')
export let TodayReqs = new Counter('Today sales Requests')
export let CurrentReqs = new Counter('Current sales Requests')
export let FeaturedReqs = new Counter('Featured sales Requests')
export let InternationalReqs = new Counter('International sales Requests')
export let PotdReqs = new Counter('POTD sales Requests')

export let options = {
    vus: 10,
    duration: '30s',
    thresholds: {
        'Home Duration': ['p(95)<500'],
        'Today sales Duration': ['p(95)<500'],
        'Current sales Duration': ['p(95)<500'],
        'Featured sales Duration': ['p(95)<500'],
        'International sales Duration': ['p(95)<500'],
        'POTD sales Duration': ['p(95)<500']
    }
}

export default function () {
    group('GET / home API', () => {
        let res = http.get(__ENV.HOST + config.api.home)

        check(res, {
            'status is 200': res => res.status == 200,
            'transaction time is less than 500ms': res => res.timings.duration < 500
        }) || HomeChecks.add(1)
        HomeDuration.add(res.timings.duration)
        HomeReqs.add(1)

        sleep(1)
    })

    group('GET / sales API', () => {
        let requests = {
            'today': __ENV.HOST + config.api.todaySales,
            'current': __ENV.HOST + config.api.currentSales,
            'featured': __ENV.HOST + config.api.featuredSales,
            'international': __ENV.HOST + config.api.internationalSales,
            'potd': __ENV.HOST + config.api.potdSales
        }
        let res = http.batch(requests)

        check(res['today'], {
            'status is 200': r => r.status == 200,
            'transaction time is less than 500ms': r => r.timings.duration < 500
        }) || TodayChecks.add(1)
        TodayDuration.add(res['today'].timings.duration)
        TodayReqs.add(1)

        check(res['current'], {
            'status is 200': r => r.status == 200,
            'transaction time is less than 500ms': r => r.timings.duration < 500
        }) || CurrentChecks.add(1)
        CurrentDuration.add(res['current'].timings.duration)
        CurrentReqs.add(1)

        check(res['featured'], {
            'status is 200': r => r.status == 200,
            'transaction time is less than 500ms': r => r.timings.duration < 500
        }) || FeaturedChecks.add(1)
        FeaturedDuration.add(res['featured'].timings.duration)
        FeaturedReqs.add(1)

        check(res['international'], {
            'status is 200': r => r.status == 200,
            'transaction time is less than 500ms': r => r.timings.duration < 500
        }) || InternationalChecks.add(1)
        InternationalDuration.add(res['international'].timings.duration)
        InternationalReqs.add(1)

        check(res['potd'], {
            'status is 200': r => r.status == 200,
            'transaction time is less than 500ms': r => r.timings.duration < 500
        }) || PotdChecks.add(1)
        PotdDuration.add(res['potd'].timings.duration)
        PotdReqs.add(1)

        sleep(1)
    })
}