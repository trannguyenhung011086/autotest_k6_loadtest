import { config, globalChecks } from '../../common/index.js'
import * as helper from '../../common/helper.js'
import http from 'k6/http'
import { sleep } from 'k6'
import { Trend, Rate, Counter } from 'k6/metrics'

export let AddCartDuration = new Trend('Cart - Add product Duration')
export let UpdateCartDuration = new Trend('Cart - Update quantity Duration')
export let RemoveCartDuration = new Trend('Cart - Remove product Duration')

export let AddCartFailRate = new Rate('Cart - Add product Fail Rate')
export let UpdateCartFailRate = new Rate('Cart - Update quantity Fail Rate')
export let RemoveCartFailRate = new Rate('Cart - Remove product Fail Rate')

export let AddCartReqs = new Counter('Cart - Add product Requests')
export let UpdateCartReqs = new Counter('Cart - Update quantity Requests')
export let RemoveCartReqs = new Counter('Cart - Remove product Requests')

let duration = 500
let rate = 0.05

export let options = {
    thresholds: {
        'Cart - Add product Duration': [`p(95)<${duration}`],
        'Cart - Add product Fail Rate': [`rate<${rate}`],
        'Cart - Update quantity Duration': [`p(95)<${duration}`],
        'Cart - Update quantity Fail Rate': [`rate<${rate}`],
        'Cart - Remove product Duration': [`p(95)<${duration}`],
        'Cart - Remove product Fail Rate': [`rate<${rate}`]
    }
}

export function setup() {
    let productInfo = helper.getProduct()
    return { product: productInfo }
}

export default function (data) {
    let product = JSON.parse(data.product)
    let random = Math.floor(Math.random() * product.products.length)

    let addCart = http.post(__ENV.HOST + config.api.cart,
        { "productId": product.products[random].id })
    let checkAdd = globalChecks(addCart, duration)
    AddCartFailRate.add(!checkAdd)
    AddCartDuration.add(addCart.timings.duration)
    AddCartReqs.add(1)

    sleep(1)

    let cart = JSON.parse(addCart.body)

    let updateCart = http.put(__ENV.HOST + config.api.cart + '/' + cart.id,
        { "quantity": "2" })
    let checkUpdate = globalChecks(updateCart, duration)
    UpdateCartFailRate.add(!checkUpdate)
    UpdateCartDuration.add(updateCart.timings.duration)
    UpdateCartReqs.add(1)

    sleep(1)

    let removeCart = http.del(__ENV.HOST + config.api.cart + '/' + cart.id)
    let checkRemove = globalChecks(removeCart, duration)
    RemoveCartFailRate.add(!checkRemove)
    RemoveCartDuration.add(removeCart.timings.duration)
    RemoveCartReqs.add(1)

    sleep(1)
}