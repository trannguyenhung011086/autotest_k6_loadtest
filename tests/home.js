import { config, globalChecks } from '../common/index.js'
import http from 'k6/http'
import { sleep, group } from 'k6'
import { Trend, Rate, Counter } from 'k6/metrics'

export let HomeFailRate = new Rate('Home Fail Rate')
export let TodayFailRate = new Rate('Today sales Fail Rate')
export let CurrentFailRate = new Rate('Current sales Fail Rate')
export let FeaturedFailRate = new Rate('Featured sales Fail Rate')
export let InternationalFailRate = new Rate('International sales Fail Rate')
export let PotdFailRate = new Rate('POTD sales Fail Rate')
export let UpcomingFailRate = new Rate('Upcoming sales Fail Rate')

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
let rate = 0.1

export let options = {
    thresholds: {
        'Home Duration': [`p(95)<${duration}`],
        'Home Fail Rate': [`rate<${rate}`],
        'Today sales Duration': [`p(95)<${duration}`],
        'Today sales Fail Rate': [`rate<${rate}`],
        'Current sales Duration': [`p(95)<${duration}`],
        'Current sales Fail Rate': [`rate<${rate}`],
        'Featured sales Duration': [`p(95)<${duration}`],
        'Featured sales Fail Rate': [`rate<${rate}`],
        'International sales Duration': [`p(95)<${duration}`],
        'International sales Fail Rate': [`rate<${rate}`],
        'POTD sales Duration': [`p(95)<${duration}`],
        'POTD sales Fail Rate': [`rate<${rate}`],
        'Upcoming sales Duration': [`p(95)<${duration}`],
        'Upcoming sales Fail Rate': [`rate<${rate}`]
    }
}

export default function () {
    group('GET / home API', () => {
        let res = http.get(__ENV.HOST + config.api.home)

        globalChecks(res, duration) || HomeFailRate.add(1)
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

        globalChecks(res['today'], duration) || TodayFailRate.add(1)
        TodayDuration.add(res['today'].timings.duration)
        TodayReqs.add(1)

        globalChecks(res['current'], duration) || CurrentFailRate.add(1)
        CurrentDuration.add(res['current'].timings.duration)
        CurrentReqs.add(1)

        globalChecks(res['featured'], duration) || FeaturedFailRate.add(1)
        FeaturedDuration.add(res['featured'].timings.duration)
        FeaturedReqs.add(1)

        globalChecks(res['international'], duration) || InternationalFailRate.add(1)
        InternationalDuration.add(res['international'].timings.duration)
        InternationalReqs.add(1)

        globalChecks(res['potd'], duration) || PotdFailRate.add(1)
        PotdDuration.add(res['potd'].timings.duration)
        PotdReqs.add(1)

        globalChecks(res['upcoming'], duration) || UpcomingFailRate.add(1)
        UpcomingDuration.add(res['upcoming'].timings.duration)
        UpcomingReqs.add(1)

        sleep(1)
    })
}