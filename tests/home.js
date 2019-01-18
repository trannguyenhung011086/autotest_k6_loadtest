import { config, globalChecks } from '../common/index.js'
import http from 'k6/http'
import { sleep, group } from 'k6'
import { Trend, Rate, Counter } from 'k6/metrics'

export let HomeChecks = new Rate('Home Checks')
export let TodayChecks = new Rate('Today sales Checks')
export let CurrentChecks = new Rate('Current sales Checks')
export let FeaturedChecks = new Rate('Featured sales Checks')
export let InternationalChecks = new Rate('International sales Checks')
export let PotdChecks = new Rate('POTD sales Checks')
export let UpcomingChecks = new Rate('Upcoming sales Checks')

export let HomeDuration = new Trend('Home Duration')
export let TodayDuration = new Trend('Today sales Duration')
export let CurrentDuration = new Trend('Current sales Duration')
export let FeaturedDuration = new Trend('Featured sales Duration')
export let InternationalDuration = new Trend('International sales Duration')
export let PotdDuration = new Trend('POTD sales Duration')
export let UpcomingDuration = new Trend('Upcoming sales Duration')

export let HomeReqs = new Counter('Home Requests')
export let TodayReqs = new Counter('Today sales Requests')
export let CurrentReqs = new Counter('Current sales Requests')
export let FeaturedReqs = new Counter('Featured sales Requests')
export let InternationalReqs = new Counter('International sales Requests')
export let PotdReqs = new Counter('POTD sales Requests')
export let UpcomingReqs = new Counter('Upcoming sales Requests')

let duration = 500
export let options = {
    vus: 10,
    duration: '30s',
    thresholds: {
        'Home Duration': [`p(95)<${duration}`],
        'Today sales Duration': [`p(95)<${duration}`],
        'Current sales Duration': [`p(95)<${duration}`],
        'Featured sales Duration': [`p(95)<${duration}`],
        'International sales Duration': [`p(95)<${duration}`],
        'POTD sales Duration': [`p(95)<${duration}`],
        'Upcoming sales Duration': [`p(95)<${duration}`]
    }
}

export default function () {
    group('GET / home API', () => {
        let res = http.get(__ENV.HOST + config.api.home)

        globalChecks(res, duration) || HomeChecks.add(1)
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
            'potd': __ENV.HOST + config.api.potdSales,
            'upcoming': __ENV.HOST + config.api.upcomingSales
        }
        let res = http.batch(requests)

        globalChecks(res['today'], duration) || TodayChecks.add(1)
        TodayDuration.add(res['today'].timings.duration)
        TodayReqs.add(1)

        globalChecks(res['current'], duration) || CurrentChecks.add(1)
        CurrentDuration.add(res['current'].timings.duration)
        CurrentReqs.add(1)

        globalChecks(res['featured'], duration) || FeaturedChecks.add(1)
        FeaturedDuration.add(res['featured'].timings.duration)
        FeaturedReqs.add(1)

        globalChecks(res['international'], duration) || InternationalChecks.add(1)
        InternationalDuration.add(res['international'].timings.duration)
        InternationalReqs.add(1)

        globalChecks(res['potd'], duration) || PotdChecks.add(1)
        PotdDuration.add(res['potd'].timings.duration)
        PotdReqs.add(1)

        globalChecks(res['upcoming'], duration) || UpcomingChecks.add(1)
        UpcomingDuration.add(res['upcoming'].timings.duration)
        UpcomingReqs.add(1)

        sleep(1)
    })
}