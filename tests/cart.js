import { config, globalChecks } from '../common/index.js'
import http from 'k6/http'
import { sleep, group } from 'k6'
import { Trend, Rate, Counter } from 'k6/metrics'

export let AddCartDuration = new Trend('Add cart Duration')
export let UpdateCartDuration = new Trend('Update cart Duration')
export let RemoveCartDuration = new Trend('Remove cart Duration')

export let AddCartChecks = new Rate('Add cart Checks')
export let UpdateCartChecks = new Rate('Update cart Checks')
export let RemoveCartChecks = new Rate('Remove cart Checks')

export let AddCartReqs = new Counter('Add cart Requests')
export let UpdateCartReqs = new Counter('Update cart Requests')
export let RemoveCartReqs = new Counter('Remove cart Requests')

let duration = 300
export let options = {
    vus: 10,
    duration: '30s',
    thresholds: {
        'Add cart Duration': [`p(95)<${duration}`],
        'Update cart Duration': [`p(95)<${duration}`],
        'Remove cart Duration': [`p(95)<${duration}`]
    }
}

export function setup() {
    let res = http.get(__ENV.HOST + config.api.todaySales)
    let sales = JSON.parse(res.body)
    let sale = http.get(__ENV.HOST + config.api.sales + sales[0].id)
    let products = (JSON.parse(sale.body)).products
    let product = http.get(__ENV.HOST + config.api.product + products[0].id)

    return product.body
}

export default function (data) {
    group('POST / add to cart API', () => {
        let res = http.post(__ENV.HOST + config.api.cart,
            { "productId": JSON.parse(data).products[0].id })

        let checkRes = globalChecks(res, duration)
        
        AddCartChecks.add(!checkRes)
        AddCartDuration.add(res.timings.duration)
        AddCartReqs.add(1)

        sleep(1)
    })

    group('PUT / update cart API', () => {
        let addCart = http.post(__ENV.HOST + config.api.cart,
            { "productId": JSON.parse(data).products[0].id })
        let res = http.put(__ENV.HOST + config.api.cart + '/' + JSON.parse(addCart.body).id,
            { "quantity": "2" })

        let checkRes = globalChecks(res, duration)
        
        UpdateCartChecks.add(!checkRes)
        UpdateCartDuration.add(res.timings.duration)
        UpdateCartReqs.add(1)

        sleep(1)
    })

    group('DELETE / remove from cart API', () => {
        let addCart = http.post(__ENV.HOST + config.api.cart,
            { "productId": JSON.parse(data).products[0].id })
        let res = http.del(__ENV.HOST + config.api.cart + '/' + JSON.parse(addCart.body).id)

        let checkRes = globalChecks(res, duration)
        
        RemoveCartChecks.add(!checkRes)
        RemoveCartDuration.add(res.timings.duration)
        RemoveCartReqs.add(1)

        sleep(1)
    })
}