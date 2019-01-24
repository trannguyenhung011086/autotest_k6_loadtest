import { config, globalChecks } from '../../common/index.js'
import * as helper from '../../common/helper.js'
import http from 'k6/http'
import { sleep } from 'k6'
import { Trend, Rate, Counter } from 'k6/metrics'

export let AddCartDuration = new Trend('Add cart Duration')
export let UpdateCartDuration = new Trend('Update cart Duration')
export let RemoveCartDuration = new Trend('Remove cart Duration')

export let AddCartFailRate = new Rate('Add cart Fail Rate')
export let UpdateCartFailRate = new Rate('Update cart Fail Rate')
export let RemoveCartFailRate = new Rate('Remove cart Fail Rate')

export let AddCartReqs = new Counter('Add cart Requests')
export let UpdateCartReqs = new Counter('Update cart Requests')
export let RemoveCartReqs = new Counter('Remove cart Requests')

let duration = 500
let rate = 0.05

export let options = {
    thresholds: {
        'Add cart Duration': [`p(95)<${duration}`],
        'Add cart Fail Rate': [`rate<${rate}`],
        'Update cart Duration': [`p(95)<${duration}`],
        'Update cart Fail Rate': [`rate<${rate}`],
        'Remove cart Duration': [`p(95)<${duration}`],
        'Remove cart Fail Rate': [`rate<${rate}`]
    }
}

export function setup() {
    let productInfo = helper.getProduct()
    return { product: productInfo }
}

export default function (data) {
    let addCart = http.post(__ENV.HOST + config.api.cart,
        { "productId": JSON.parse(data.product).products[0].id })
    let checkAdd = globalChecks(addCart, duration)
    AddCartFailRate.add(!checkAdd)
    AddCartDuration.add(addCart.timings.duration)
    AddCartReqs.add(1)


    let updateCart = http.put(__ENV.HOST + config.api.cart + '/' + JSON.parse(addCart.body).id,
        { "quantity": "2" })
    let checkUpdate = globalChecks(updateCart, duration)
    UpdateCartFailRate.add(!checkUpdate)
    UpdateCartDuration.add(updateCart.timings.duration)
    UpdateCartReqs.add(1)

    let removeCart = http.del(__ENV.HOST + config.api.cart + '/' + JSON.parse(addCart.body).id)
    let checkRemove = globalChecks(removeCart, duration)
    RemoveCartFailRate.add(!checkRemove)
    RemoveCartDuration.add(removeCart.timings.duration)
    RemoveCartReqs.add(1)

    sleep(1)
}