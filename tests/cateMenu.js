import config from '../common/config.js'
import http from 'k6/http'
import { check, sleep } from 'k6'
import { Trend, Rate, Counter } from 'k6/metrics'

export let ApparelDuration = new Trend('Get apparel Duration')
export let BagsShoesDuration = new Trend('Get bags shoes Duration')
export let AccessoriesDuration = new Trend('Get accessories Duration')
export let HealthBeautyDuration = new Trend('Get health beauty Duration')
export let HomeLifeStyleDuration = new Trend('Get home life style Duration')

export let ApparelChecks = new Rate('Get apparel Checks')
export let BagsShoesChecks = new Rate('Get bags shoes Checks')
export let AccessoriesChecks = new Rate('Get accessories Checks')
export let HealthBeautyChecks = new Rate('Get health beauty Checks')
export let HomeLifeStyleChecks = new Rate('Get home life style Checks')

export let ApparelReqs = new Counter('Get apparel Requests')
export let BagsShoesReqs = new Counter('Get bags shoes Requests')
export let AccessoriesReqs = new Counter('Get accessories Requests')
export let HealthBeautyReqs = new Counter('Get health beauty Requests')
export let HomeLifeStyleReqs = new Counter('Get home life style Requests')

let duration = 300
export let options = {
    vus: 10,
    duration: '30s',
    thresholds: {
        'Get apparel Duration': [`p(95)<${duration}`],
        'Get bags shoes Duration': [`p(95)<${duration}`],
        'Get accessories Duration': [`p(95)<${duration}`],
        'Get health beauty Duration': [`p(95)<${duration}`],
        'Get home life style Duration': [`p(95)<${duration}`]
    }
}

export default function () {
    let requests = {
        'apparel': __ENV.HOST + config.api.cateApparel,
        'bags': __ENV.HOST + config.api.cateBagsShoes,
        'accessories': __ENV.HOST + config.api.cateAccessories,
        'health': __ENV.HOST + config.api.cateHealthBeauty,
        'home': __ENV.HOST + config.api.cateHomeLifeStyle
    }
    let res = http.batch(requests)

    check(res['apparel'], {
        'status is OK': r => r.status == 200,
        'transaction time is less than threshold': r => r.timings.duration < duration
    }) || ApparelChecks.add(1)
    ApparelDuration.add(res['apparel'].timings.duration)
    ApparelReqs.add(1)

    check(res['bags'], {
        'status is OK': r => r.status == 200,
        'transaction time is less than threshold': r => r.timings.duration < duration
    }) || BagsShoesChecks.add(1)
    BagsShoesDuration.add(res['bags'].timings.duration)
    BagsShoesReqs.add(1)

    check(res['accessories'], {
        'status is OK': r => r.status == 200,
        'transaction time is less than threshold': r => r.timings.duration < duration
    }) || AccessoriesChecks.add(1)
    AccessoriesDuration.add(res['accessories'].timings.duration)
    AccessoriesReqs.add(1)

    check(res['health'], {
        'status is OK': r => r.status == 200,
        'transaction time is less than threshold': r => r.timings.duration < duration
    }) || HealthBeautyChecks.add(1)
    HealthBeautyDuration.add(res['health'].timings.duration)
    HealthBeautyReqs.add(1)

    check(res['home'], {
        'status is OK': r => r.status == 200,
        'transaction time is less than threshold': r => r.timings.duration < duration
    }) || HomeLifeStyleChecks.add(1)
    HomeLifeStyleDuration.add(res['home'].timings.duration)
    HomeLifeStyleReqs.add(1)

    sleep(1)
}