import { config, globalChecks } from '../../common/index.js'
import http from 'k6/http'
import { sleep } from 'k6'
import { Trend, Rate, Counter } from 'k6/metrics'

export let MenuDuration = new Trend('Get top menu Duration')
export let ApparelDuration = new Trend('Get apparel menu Duration')
export let BagsShoesDuration = new Trend('Get bags shoes menu Duration')
export let AccessoriesDuration = new Trend('Get accessories menu Duration')
export let HealthBeautyDuration = new Trend('Get health beauty menu Duration')
export let HomeLifeStyleDuration = new Trend('Get home life style menu Duration')

export let MenuFailRate = new Rate('Get top menu Fail Rate')
export let ApparelFailRate = new Rate('Get apparel menu Fail Rate')
export let BagsShoesFailRate = new Rate('Get bags shoes menu Fail Rate')
export let AccessoriesFailRate = new Rate('Get accessories menu Fail Rate')
export let HealthBeautyFailRate = new Rate('Get health beauty menu Fail Rate')
export let HomeLifeStyleFailRate = new Rate('Get home life style menu Fail Rate')

export let MenuReqs = new Counter('Get top menu Requests')
export let ApparelReqs = new Counter('Get apparel menu Requests')
export let BagsShoesReqs = new Counter('Get bags shoes menu Requests')
export let AccessoriesReqs = new Counter('Get accessories menu Requests')
export let HealthBeautyReqs = new Counter('Get health beauty menu Requests')
export let HomeLifeStyleReqs = new Counter('Get home life style menu Requests')

let duration = 100
let rate = 0.05

export let options = {
    thresholds: {
        'Get top menu Duration': [`p(95)<${duration}`],
        'Get top menu Fail Rate': [`rate<${rate}`],
        'Get apparel menu Duration': [`p(95)<${duration}`],
        'Get apparel menu Fail Rate': [`rate<${rate}`],
        'Get bags shoes menu Duration': [`p(95)<${duration}`],
        'Get bags shoes menu Fail Rate': [`rate<${rate}`],
        'Get accessories menu Duration': [`p(95)<${duration}`],
        'Get accessories menu Fail Rate': [`rate<${rate}`],
        'Get health beauty menu Duration': [`p(95)<${duration}`],
        'Get health beauty menu Fail Rate': [`rate<${rate}`],
        'Get home life style menu Duration': [`p(95)<${duration}`],
        'Get home life style menu Fail Rate': [`rate<${rate}`]
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

    let checkTop = globalChecks(res['top'], duration)
    MenuFailRate.add(!checkTop)
    MenuDuration.add(res['top'].timings.duration)
    MenuReqs.add(1)

    let checkApparel = globalChecks(res['apparel'], duration)
    ApparelFailRate.add(!checkApparel)
    ApparelDuration.add(res['apparel'].timings.duration)
    ApparelReqs.add(1)

    let checkBags = globalChecks(res['bags'], duration)
    BagsShoesFailRate.add(!checkBags)
    BagsShoesDuration.add(res['bags'].timings.duration)
    BagsShoesReqs.add(1)

    let checkAccessories = globalChecks(res['accessories'], duration)
    AccessoriesFailRate.add(!checkAccessories)
    AccessoriesDuration.add(res['accessories'].timings.duration)
    AccessoriesReqs.add(1)

    let checkHealth = globalChecks(res['health'], duration)
    HealthBeautyFailRate.add(!checkHealth)
    HealthBeautyDuration.add(res['health'].timings.duration)
    HealthBeautyReqs.add(1)

    let checkHome = globalChecks(res['home'], duration)
    HomeLifeStyleFailRate.add(!checkHome)
    HomeLifeStyleDuration.add(res['home'].timings.duration)
    HomeLifeStyleReqs.add(1)

    sleep(1)
}