import { config, globalChecks } from '../../common/index.js'
import http from 'k6/http'
import { sleep } from 'k6'
import { Trend, Rate, Counter } from 'k6/metrics'

export let ApparelDuration = new Trend('View apparel Duration')
export let BagsShoesDuration = new Trend('View bags shoes Duration')
export let AccessoriesDuration = new Trend('View accessories Duration')
export let HealthBeautyDuration = new Trend('View health beauty Duration')
export let HomeLifeStyleDuration = new Trend('View home life style Duration')

export let ApparelFailRate = new Rate('View apparel Fail Rate')
export let BagsShoesFailRate = new Rate('View bags shoes Fail Rate')
export let AccessoriesFailRate = new Rate('View accessories Fail Rate')
export let HealthBeautyFailRate = new Rate('View health beauty Fail Rate')
export let HomeLifeStyleFailRate = new Rate('View home life style Fail Rate')

export let ApparelReqs = new Counter('View apparel Requests')
export let BagsShoesReqs = new Counter('View bags shoes Requests')
export let AccessoriesReqs = new Counter('View accessories Requests')
export let HealthBeautyReqs = new Counter('View health beauty Requests')
export let HomeLifeStyleReqs = new Counter('View home life style Requests')

let duration = 3000
let rate = 0.05

export let options = {
    thresholds: {
        'View apparel Duration': [`p(95)<${duration}`],
        'View apparel Fail Rate': [`rate<${rate}`],
        'View bags shoes Duration': [`p(95)<${duration}`],
        'View bags shoes Fail Rate': [`rate<${rate}`],
        'View accessories Duration': [`p(95)<${duration}`],
        'View accessories Fail Rate': [`rate<${rate}`],
        'View health beauty Duration': [`p(95)<${duration}`],
        'View health beauty Fail Rate': [`rate<${rate}`],
        'View home life style Duration': [`p(95)<${duration}`],
        'View home life style Fail Rate': [`rate<${rate}`]
    }
}

export default function () {
    let requests = {
        'apparel': {
            method: 'GET',
            url: __ENV.HOST + '/categories' + config.api.cateApparel.replace('/api/menus/items', ''),
            params: {
                headers: {
                    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/62.0.3183.0 Safari/537.36"
                }
            }
        },
        'bags': {
            method: 'GET',
            url: __ENV.HOST + '/categories' + config.api.cateBagsShoes.replace('/api/menus/items', ''),
            params: {
                headers: {
                    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/62.0.3183.0 Safari/537.36"
                }
            }
        },
        'accessories': {
            method: 'GET',
            url: __ENV.HOST + '/categories' + config.api.cateAccessories.replace('/api/menus/items', ''),
            params: {
                headers: {
                    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/62.0.3183.0 Safari/537.36"
                }
            }
        },
        'health': {
            method: 'GET',
            url: __ENV.HOST + '/categories' + config.api.cateHealthBeauty.replace('/api/menus/items', ''),
            params: {
                headers: {
                    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/62.0.3183.0 Safari/537.36"
                }
            }
        },
        'home': {
            method: 'GET',
            url: __ENV.HOST + '/categories' + config.api.cateHomeLifeStyle.replace('/api/menus/items', ''),
            params: {
                headers: {
                    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/62.0.3183.0 Safari/537.36"
                }
            }
        }
    }
    let res = http.batch(requests)

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