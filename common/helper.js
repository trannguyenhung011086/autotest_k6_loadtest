import { config } from './index.js'
import http from 'k6/http'

export function getCookies() {
    let res = http.post(__ENV.HOST + config.api.signIn, {
        "email": config.testAccount.email2, "password": config.testAccount.password
    })

    return JSON.stringify(res.cookies)
}

export function getBrandList() {
    let brandList = []
    let res = http.get(__ENV.HOST + config.api.brands)
    res.body = JSON.parse(res.body)

    for (let item of Object.keys(res.body)) {
        let list = res.body[item]
        for (let listItem of list) {
            brandList.push(listItem)
        }
    }

    return brandList
}

export function getProduct() {
    let res = http.get(__ENV.HOST + config.api.internationalSales)
    let sales = JSON.parse(res.body)
    let sale = http.get(__ENV.HOST + config.api.sales + sales[0].id)
    let products = (JSON.parse(sale.body)).products
    let product = http.get(__ENV.HOST + config.api.product + products[0].id)

    return product.body
}

export function getSale() {
    let res = http.get(__ENV.HOST + config.api.todaySales)
    let sales = JSON.parse(res.body)
    let sale = http.get(__ENV.HOST + config.api.sales + sales[0].id)

    return sale.body
}

export function getSales() {
    let requests = {
        'ongoing': __ENV.HOST + config.api.currentSales,
        'upcoming': __ENV.HOST + config.api.upcomingSales
    }
    let res = http.batch(requests)

    return {
        ongoing: res['ongoing'].body,
        upcoming: res['upcoming'].body
    }
}

export function getOrders() {
    let res = http.get(__ENV.HOST + config.api.orders)
    return res.body
}