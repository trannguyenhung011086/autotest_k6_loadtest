import config from '../common/config.js'
import http from 'k6/http'
import { check, sleep, group } from 'k6'
import { Trend, Rate, Counter } from 'k6/metrics'

export let AddCartDuration = new Trend('Add cart Duration')
export let UpdateCartDuration = new Trend('Update cart Duration')
export let RemoveCartDuration = new Trend('Remove cart Duration')

export let AddCartChecks = new Trend('Add cart Checks')
export let UpdateCartChecks = new Trend('Update cart Checks')
export let RemoveCartChecks = new Trend('Remove cart Checks')

export let AddCartReqs = new Trend('Add cart Requests')
export let UpdateCartReqs = new Trend('Update cart Requests')
export let RemoveCartReqs = new Trend('Remove cart Requests')

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

        check(res, {
            'status is OK': res => res.status == 200,
            'transaction time is less than threshold': res => res.timings.duration < duration
        }) || AddCartChecks.add(1)
        AddCartDuration.add(res.timings.duration)
        AddCartReqs.add(1)

        sleep(1)
    })

    group('PUT / update cart API', () => {
        let addCart = http.post(__ENV.HOST + config.api.cart,
            { "productId": JSON.parse(data).products[0].id })
        let res = http.put(__ENV.HOST + config.api.cart + '/' + JSON.parse(addCart.body).id,
            { "quantity": "2" })

        check(res, {
            'status is OK': res => res.status == 200,
            'transaction time is less than threshold': res => res.timings.duration < duration
        }) || UpdateCartChecks.add(1)
        UpdateCartDuration.add(res.timings.duration)
        UpdateCartReqs.add(1)

        sleep(1)
    })

    group('DELETE / remove from cart API', () => {
        let addCart = http.post(__ENV.HOST + config.api.cart,
            { "productId": JSON.parse(data).products[0].id })
        let res = http.del(__ENV.HOST + config.api.cart + '/' + JSON.parse(addCart.body).id)

        check(res, {
            'status is OK': res => res.status == 200,
            'transaction time is less than threshold': res => res.timings.duration < duration
        }) || RemoveCartChecks.add(1)
        RemoveCartDuration.add(res.timings.duration)
        RemoveCartReqs.add(1)

        sleep(1)
    })
}