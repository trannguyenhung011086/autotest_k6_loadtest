import { config, globalChecks } from '../common/index.js'
import http from 'k6/http'
import { sleep } from 'k6'
import { Trend, Rate, Counter } from 'k6/metrics'

export let MenuDuration = new Trend('Get top menu Duration')
export let ApparelDuration = new Trend('Get apparel Duration')
export let BagsShoesDuration = new Trend('Get bags shoes Duration')
export let AccessoriesDuration = new Trend('Get accessories Duration')
export let HealthBeautyDuration = new Trend('Get health beauty Duration')
export let HomeLifeStyleDuration = new Trend('Get home life style Duration')

export let MenuFailRate = new Rate('Get top menu Fail Rate')
export let ApparelFailRate = new Rate('Get apparel Fail Rate')
export let BagsShoesFailRate = new Rate('Get bags shoes Fail Rate')
export let AccessoriesFailRate = new Rate('Get accessories Fail Rate')
export let HealthBeautyFailRate = new Rate('Get health beauty Fail Rate')
export let HomeLifeStyleFailRate = new Rate('Get home life style Fail Rate')

export let MenuReqs = new Counter('Get top menu Requests')
export let ApparelReqs = new Counter('Get apparel Requests')
export let BagsShoesReqs = new Counter('Get bags shoes Requests')
export let AccessoriesReqs = new Counter('Get accessories Requests')
export let HealthBeautyReqs = new Counter('Get health beauty Requests')
export let HomeLifeStyleReqs = new Counter('Get home life style Requests')

let duration = 100
let rate = 0.1

export let options = {
    thresholds: {
        'Get top menu Duration': [`p(95)<${duration}`],
        'Get top menu Fail Rate': [`rate<${rate}`],
        'Get apparel Duration': [`p(95)<${duration}`],
        'Get apparel Fail Rate': [`rate<${rate}`],
        'Get bags shoes Duration': [`p(95)<${duration}`],
        'Get bags shoes Fail Rate': [`rate<${rate}`],
        'Get accessories Duration': [`p(95)<${duration}`],
        'Get accessories Fail Rate': [`rate<${rate}`],
        'Get health beauty Duration': [`p(95)<${duration}`],
        'Get health beauty Fail Rate': [`rate<${rate}`],
        'Get home life style Duration': [`p(95)<${duration}`],
        'Get home life style Fail Rate': [`rate<${rate}`]
    }
}

export default function () {
    let requests = {
        'top': __ENV.HOST + config.api.cateMenu,
        'apparel': __ENV.HOST + config.api.cateApparel,
        'bags': __ENV.HOST + config.api.cateBagsShoes,
        'accessories': __ENV.HOST + config.api.cateAccessories,
        'health': __ENV.HOST + config.api.cateHealthBeauty,
        'home': __ENV.HOST + config.api.cateHomeLifeStyle
    }
    let res = http.batch(requests)

    let checkResTop = globalChecks(res['top'], duration)
    MenuFailRate.add(!checkResTop)
    MenuDuration.add(res['top'].timings.duration)
    MenuReqs.add(1)

    let checkResApparel = globalChecks(res['apparel'], duration)
    ApparelFailRate.add(!checkResApparel)
    ApparelDuration.add(res['apparel'].timings.duration)
    ApparelReqs.add(1)

    let checkResBags = globalChecks(res['bags'], duration)
    BagsShoesFailRate.add(!checkResBags)
    BagsShoesDuration.add(res['bags'].timings.duration)
    BagsShoesReqs.add(1)

    let checkResAccessories = globalChecks(res['accessories'], duration)
    AccessoriesFailRate.add(!checkResAccessories)
    AccessoriesDuration.add(res['accessories'].timings.duration)
    AccessoriesReqs.add(1)

    let checkResHealth = globalChecks(res['health'], duration)
    HealthBeautyFailRate.add(!checkResHealth)
    HealthBeautyDuration.add(res['health'].timings.duration)
    HealthBeautyReqs.add(1)

    let checkResHome = globalChecks(res['home'], duration)
    HomeLifeStyleFailRate.add(!checkResHome)
    HomeLifeStyleDuration.add(res['home'].timings.duration)
    HomeLifeStyleReqs.add(1)

    sleep(1)
}