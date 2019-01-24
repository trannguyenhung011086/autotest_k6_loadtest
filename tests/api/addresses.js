import { config, globalChecks } from '../../common/index.js'
import * as helper from '../../common/helper.js'
import http from 'k6/http'
import { sleep, group } from 'k6'
import { Trend, Rate, Counter } from 'k6/metrics'
import faker from 'cdnjs.com/libraries/Faker'

export let GetAddressesDuration = new Trend('Address - Get info Duration')
export let AddAddressDuration = new Trend('Address - Add Duration')
export let UpdateShippingDuration = new Trend('Address - Update shipping Duration')
export let UpdateBillingDuration = new Trend('Address - Update billing Duration')
export let DeleteShippingDuration = new Trend('Address - Delete shipping Duration')
export let DeleteBillingDuration = new Trend('Address - Delete billing Duration')

export let GetAddressesFailRate = new Rate('Address - Get infos Fail Rate')
export let AddAddressFailRate = new Rate('Address - Add Fail Rate')
export let UpdateShippingFailRate = new Rate('Address - Update shipping Fail Rate')
export let UpdateBillingFailRate = new Rate('Address - Update billing Fail Rate')
export let DeleteShippingFailRate = new Rate('Address - Delete shipping Fail Rate')
export let DeleteBillingFailRate = new Rate('Address - Delete billing Fail Rate')

export let GetAddressesReqs = new Counter('Address - Get info Requests')
export let AddAddressReqs = new Counter('Address - Add Requests')
export let UpdateShippingReqs = new Counter('Address - Update shipping Requests')
export let UpdateBillingReqs = new Counter('Address - Update billing Requests')
export let DeleteShippingReqs = new Counter('Address - Delete shipping Requests')
export let DeleteBillingReqs = new Counter('Address - Delete billing Requests')

let duration = 500
let rate = 0.05

export let options = {
    thresholds: {
        'Address - Get info Duration': [`p(95)<${duration}`],
        'Address - Get info Fail Rate': [`rate<${rate}`],
        'Address - Add Duration': [`p(95)<${duration}`],
        'Address - Add Fail Rate': [`rate<${rate}`],
        'Address - Update shipping Duration': [`p(95)<${duration}`],
        'Address - Update shipping Fail Rate': [`rate<${rate}`],
        'Address - Update billing Duration': [`p(95)<${duration}`],
        'Address - Update billing Fail Rate': [`rate<${rate}`],
        'Address - Delete shipping Duration': [`p(95)<${duration}`],
        'Address - Delete shipping Fail Rate': [`rate<${rate}`],
        'Address - Delete billing Duration': [`p(95)<${duration}`],
        'Address - Delete billing Fail Rate': [`rate<${rate}`]
    }
}

export function setup() {
    let userCookies = helper.getCookies()
    return { cookies: userCookies }
}

export default function (data) {
    let jar = http.cookieJar()
    jar.set(__ENV.HOST, 'leflair.connect.sid', JSON.parse(data.cookies)['leflair.connect.sid'][0].value)

    group('GET / Address - Get info API', () => {
        let res = http.get(__ENV.HOST + config.api.addresses)

        let check = globalChecks(res, duration)
        GetAddressesFailRate.add(!check)
        GetAddressesDuration.add(res.timings.duration)
        GetAddressesReqs.add(1)

        sleep(1)
    })

    group('POST / Address - Add API', () => {
        let body = JSON.stringify({
            address: faker.address.streetAddress(),
            city: {
                id: '578c1c2c4bda02a85e93f1b9',
                name: 'Hồ Chí Minh'
            },
            default: true,
            district: {
                id: '578c1c2c4bda02a85e93f1fa',
                name: 'Quận 1'
            },
            duplicateBilling: true,
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            phone: '0123456789',
            type: 'shipping'
        })

        let res = http.post(__ENV.HOST + config.api.addresses, body,
            { headers: { "Content-Type": "application/json" } })

        let check = globalChecks(res, duration)
        AddAddressFailRate.add(!check)
        AddAddressDuration.add(res.timings.duration)
        AddAddressReqs.add(1)

        sleep(1)
    })

    group('PUT / Address - Update shipping address API', () => {
        let addresses = http.get(__ENV.HOST + config.api.addresses)
        let shipping = JSON.parse(addresses.body).shipping

        let body = JSON.stringify({
            id: shipping[0].id,
            address: faker.address.streetAddress(),
            city: {
                id: '578c1c2c4bda02a85e93f1b9',
                name: 'Hồ Chí Minh'
            },
            default: true,
            district: {
                id: '578c1c2c4bda02a85e93f1fe',
                name: 'Quận 5'
            },
            duplicateBilling: true,
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            phone: '0123456789',
            type: 'shipping'
        })

        let res = http.put(__ENV.HOST + config.api.addresses + '/' + shipping[0].id,
            body, { headers: { "Content-Type": "application/json" } })

        let check = globalChecks(res, duration)
        UpdateShippingFailRate.add(!check)
        UpdateShippingDuration.add(res.timings.duration)
        UpdateShippingReqs.add(1)

        sleep(1)
    })

    group('PUT / Address - Update billing address API', () => {
        let addresses = http.get(__ENV.HOST + config.api.addresses)
        let billing = JSON.parse(addresses.body).billing

        let body = JSON.stringify({
            id: billing[0].id,
            address: faker.address.streetAddress(),
            city: {
                id: '578c1c2c4bda02a85e93f1b9',
                name: 'Hồ Chí Minh'
            },
            default: true,
            district: {
                id: '578c1c2c4bda02a85e93f1fe',
                name: 'Quận 5'
            },
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            phone: '0123456789',
            type: 'billing'
        })

        let res = http.put(__ENV.HOST + config.api.addresses + '/' + billing[0].id,
            body, { headers: { "Content-Type": "application/json" } })

        let check = globalChecks(res, duration)
        UpdateBillingFailRate.add(!check)
        UpdateBillingDuration.add(res.timings.duration)
        UpdateBillingReqs.add(1)

        sleep(1)
    })

    group('DELETE / Address - Delete shipping address API', () => {
        let addresses = http.get(__ENV.HOST + config.api.addresses)
        let shipping = JSON.parse(addresses.body).shipping

        let res = http.del(__ENV.HOST + config.api.addresses + '/' + shipping[0].id)

        let check = globalChecks(res, duration)
        DeleteShippingFailRate.add(!check)
        DeleteShippingDuration.add(res.timings.duration)
        DeleteShippingReqs.add(1)

        sleep(1)
    })

    group('DELETE / Address - Delete billing address API', () => {
        let addresses = http.get(__ENV.HOST + config.api.addresses)
        let billing = JSON.parse(addresses.body).billing

        let res = http.del(__ENV.HOST + config.api.addresses + '/' + billing[0].id)

        let check = globalChecks(res, duration)
        DeleteBillingFailRate.add(!check)
        DeleteBillingDuration.add(res.timings.duration)
        DeleteBillingReqs.add(1)

        sleep(1)
    })
}