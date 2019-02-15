// import { config, Helper } from '../../common/index.js'
import { config } from '../../common/config.js'
import * as helper from '../../common/helper.js'
import http from 'k6/http'
import { sleep } from 'k6'
import { Trend, Rate, Counter } from 'k6/metrics'

export let MenuDuration = new Trend('Menu - Get top Duration')
export let ApparelDuration = new Trend('Menu - Get apparel Duration')
export let BagsShoesDuration = new Trend('Menu - Get bags shoes Duration')
export let AccessoriesDuration = new Trend('Menu - Get accessories Duration')
export let HealthBeautyDuration = new Trend('Menu - Get health beauty Duration')
export let HomeLifeStyleDuration = new Trend('Menu - Get home life style Duration')

export let MenuFailRate = new Rate('Menu - Get top Fail Rate')
export let ApparelFailRate = new Rate('Menu - Get apparel Fail Rate')
export let BagsShoesFailRate = new Rate('Menu - Get bags shoes Fail Rate')
export let AccessoriesFailRate = new Rate('Menu - Get accessories Fail Rate')
export let HealthBeautyFailRate = new Rate('Menu - Get health beauty Fail Rate')
export let HomeLifeStyleFailRate = new Rate('Menu - Get home life style Fail Rate')

export let MenuReqs = new Counter('Menu - Get top Requests')
export let ApparelReqs = new Counter('Menu - Get apparel Requests')
export let BagsShoesReqs = new Counter('Menu - Get bags shoes Requests')
export let AccessoriesReqs = new Counter('Menu - Get accessories Requests')
export let HealthBeautyReqs = new Counter('Menu - Get health beauty Requests')
export let HomeLifeStyleReqs = new Counter('Menu - Get home life style Requests')

let duration = 100
let rate = 0.05

export let options = {
    thresholds: {
        'Menu - Get top Duration': [`p(95)<${duration}`],
        'Menu - Get top Fail Rate': [`rate<${rate}`],
        'Menu - Get apparel Duration': [`p(95)<${duration}`],
        'Menu - Get apparel Fail Rate': [`rate<${rate}`],
        'Menu - Get bags shoes Duration': [`p(95)<${duration}`],
        'Menu - Get bags shoes Fail Rate': [`rate<${rate}`],
        'Menu - Get accessories Duration': [`p(95)<${duration}`],
        'Menu - Get accessories Fail Rate': [`rate<${rate}`],
        'Menu - Get health beauty Duration': [`p(95)<${duration}`],
        'Menu - Get health beauty Fail Rate': [`rate<${rate}`],
        'Menu - Get home life style Duration': [`p(95)<${duration}`],
        'Menu - Get home life style Fail Rate': [`rate<${rate}`]
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

    let checkTop = helper.globalChecks(res['top'], duration)
    MenuFailRate.add(!checkTop)
    MenuDuration.add(res['top'].timings.duration)
    MenuReqs.add(1)

    let checkApparel = helper.globalChecks(res['apparel'], duration)
    ApparelFailRate.add(!checkApparel)
    ApparelDuration.add(res['apparel'].timings.duration)
    ApparelReqs.add(1)

    let checkBags = helper.globalChecks(res['bags'], duration)
    BagsShoesFailRate.add(!checkBags)
    BagsShoesDuration.add(res['bags'].timings.duration)
    BagsShoesReqs.add(1)

    let checkAccessories = helper.globalChecks(res['accessories'], duration)
    AccessoriesFailRate.add(!checkAccessories)
    AccessoriesDuration.add(res['accessories'].timings.duration)
    AccessoriesReqs.add(1)

    let checkHealth = helper.globalChecks(res['health'], duration)
    HealthBeautyFailRate.add(!checkHealth)
    HealthBeautyDuration.add(res['health'].timings.duration)
    HealthBeautyReqs.add(1)

    let checkHome = helper.globalChecks(res['home'], duration)
    HomeLifeStyleFailRate.add(!checkHome)
    HomeLifeStyleDuration.add(res['home'].timings.duration)
    HomeLifeStyleReqs.add(1)

    sleep(1)
}