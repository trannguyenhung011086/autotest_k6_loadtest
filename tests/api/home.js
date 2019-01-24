import { config, globalChecks } from '../../common/index.js'
import http from 'k6/http'
import { sleep, group } from 'k6'
import { Trend, Rate, Counter } from 'k6/metrics'

export let TodayFailRate = new Rate('Get today sales Fail Rate')
export let CurrentFailRate = new Rate('Get current sales Fail Rate')
export let FeaturedFailRate = new Rate('Get featured sales Fail Rate')
export let InternationalFailRate = new Rate('Get international sales Fail Rate')
export let PotdFailRate = new Rate('Get POTD sales Fail Rate')
export let UpcomingFailRate = new Rate('Get upcoming sales Fail Rate')

export let TodayDuration = new Trend('Get today sales Duration')
export let CurrentDuration = new Trend('Get current sales Duration')
export let FeaturedDuration = new Trend('Get featured sales Duration')
export let InternationalDuration = new Trend('Get international sales Duration')
export let PotdDuration = new Trend('Get POTD sales Duration')
export let UpcomingDuration = new Trend('Get upcoming sales Duration')

export let TodayReqs = new Counter('Get today sales Requests')
export let CurrentReqs = new Counter('Get current sales Requests')
export let FeaturedReqs = new Counter('Get featured sales Requests')
export let InternationalReqs = new Counter('Get international sales Requests')
export let PotdReqs = new Counter('Get POTD sales Requests')
export let UpcomingReqs = new Counter('Get upcoming sales Requests')

let duration = 1000
let rate = 0.05

export let options = {
    thresholds: {
        'Get today sales Duration': [`p(95)<${duration}`],
        'Get today sales Fail Rate': [`rate<${rate}`],
        'Get current sales Duration': [`p(95)<${duration}`],
        'Get current sales Fail Rate': [`rate<${rate}`],
        'Get featured sales Duration': [`p(95)<${duration}`],
        'Get featured sales Fail Rate': [`rate<${rate}`],
        'Get international sales Duration': [`p(95)<${duration}`],
        'Get international sales Fail Rate': [`rate<${rate}`],
        'Get POTD sales Duration': [`p(95)<${duration}`],
        'Get POTD sales Fail Rate': [`rate<${rate}`],
        'Get upcoming sales Duration': [`p(95)<${duration}`],
        'Get upcoming sales Fail Rate': [`rate<${rate}`]
    }
}

export default function () {
    let requests = {
        'today': __ENV.HOST + config.api.todaySales,
        'current': __ENV.HOST + config.api.currentSales,
        'featured': __ENV.HOST + config.api.featuredSales,
        'international': __ENV.HOST + config.api.internationalSales,
        'potd': __ENV.HOST + config.api.potdSales,
        'upcoming': __ENV.HOST + config.api.upcomingSales
    }
    let res = http.batch(requests)

    let checkToday = globalChecks(res['today'], duration)
    TodayFailRate.add(!checkToday)
    TodayDuration.add(res['today'].timings.duration)
    TodayReqs.add(1)

    let checkCurrent = globalChecks(res['current'], duration)
    CurrentFailRate.add(!checkCurrent)
    CurrentDuration.add(res['current'].timings.duration)
    CurrentReqs.add(1)

    let checkFeatured = globalChecks(res['featured'], duration)
    FeaturedFailRate.add(!checkFeatured)
    FeaturedDuration.add(res['featured'].timings.duration)
    FeaturedReqs.add(1)

    let checkInternational = globalChecks(res['international'], duration)
    InternationalFailRate.add(!checkInternational)
    InternationalDuration.add(res['international'].timings.duration)
    InternationalReqs.add(1)

    let checkPotd = globalChecks(res['potd'], duration)
    PotdFailRate.add(!checkPotd)
    PotdDuration.add(res['potd'].timings.duration)
    PotdReqs.add(1)

    let checkUpcoming = globalChecks(res['upcoming'], duration)
    UpcomingFailRate.add(!checkUpcoming)
    UpcomingDuration.add(res['upcoming'].timings.duration)
    UpcomingReqs.add(1)

    sleep(1)
}