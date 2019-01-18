import config from './common/config.js'
import http from 'k6/http'
import { group, sleep, check } from 'k6'
import BestSellerTest from './tests/bestSellers.js'
import CateMenuTest from './tests/cateMenu.js'

// export function setup() {
//     let res = http.post(__ENV.HOST + config.api.signIn, {
//         "email": config.testAccount.email, "password": config.testAccount.password
//     })
//     return JSON.stringify(res.cookies)

//     let brandList = []
//     let res = http.get(__ENV.HOST + config.api.brands)
//     res.body = JSON.parse(res.body)

//     for (let item of Object.keys(res.body)) {
//         let list = res.body[item]
//         for (let listItem of list) {
//             brandList.push(listItem)
//         }
//     }
//     console.log('total brands: ' + brandList.length)
//     return brandList

//     let res = http.get(__ENV.HOST + config.api.todaySales)
//     let sales = JSON.parse(res.body)
//     let sale = http.get(__ENV.HOST + config.api.sales + sales[0].id)
//     let products = (JSON.parse(sale.body)).products
//     let product = http.get(__ENV.HOST + config.api.product + products[0].id)

//     return product.body

//     let res = http.get(__ENV.HOST + config.api.todaySales)
//     let sales = JSON.parse(res.body)
//     let sale = http.get(__ENV.HOST + config.api.sales + sales[0].id)
//     return sale.body

//     let requests = {
//         'ongoing': __ENV.HOST + config.api.currentSales,
//         'upcoming': __ENV.HOST + config.api.upcomingSales
//     }
//     let res = http.batch(requests)

//     return {
//         ongoing: res['ongoing'].body,
//         upcoming: res['upcoming'].body
//     }
// }

export default () => {
    group('Best sellers', () => {
        BestSellerTest()
    })

    group('Category menu', () => {
        CateMenuTest()
    })
    
    sleep(1)
}