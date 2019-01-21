import { config, globalChecks } from '../common/index.js'
import * as helper from '../common/helper.js'
import http from 'k6/http'
import { sleep, group } from 'k6'
import { Trend, Rate, Counter } from 'k6/metrics'
import faker from 'cdnjs.com/libraries/Faker'

export let GetAddressesDuration = new Trend('Get addresses Duration')
export let AddAddressDuration = new Trend('Add address Duration')
export let UpdateShippingDuration = new Trend('Update shipping Duration')
export let UpdateBillingDuration = new Trend('Update billing Duration')
export let DeleteShippingDuration = new Trend('Delete shipping Duration')
export let DeleteBillingDuration = new Trend('Delete billing Duration')

export let GetAddressesFailRate = new Rate('Get addressess Fail Rate')
export let AddAddressFailRate = new Rate('Add address Fail Rate')
export let UpdateShippingFailRate = new Rate('Update shipping Fail Rate')
export let UpdateBillingFailRate = new Rate('Update billing Fail Rate')
export let DeleteShippingFailRate = new Rate('Delete shipping Fail Rate')
export let DeleteBillingFailRate = new Rate('Delete billing Fail Rate')

export let GetAddressesReqs = new Counter('Get addresses Requests')
export let AddAddressReqs = new Counter('Add address Requests')
export let UpdateShippingReqs = new Counter('Update shipping Requests')
export let UpdateBillingReqs = new Counter('Update billing Requests')
export let DeleteShippingReqs = new Counter('Delete shipping Requests')
export let DeleteBillingReqs = new Counter('Delete billing Requests')

let duration = 500
let rate = 0.1

export let options = {
    thresholds: {
        'Get addresses Duration': [`p(95)<${duration}`],
        'Get addresses Fail Rate': [`rate<${rate}`],
        'Add address Duration': [`p(95)<${duration}`],
        'Add address Fail Rate': [`rate<${rate}`],
        'Update shipping Duration': [`p(95)<${duration}`],
        'Update shipping Fail Rate': [`rate<${rate}`],
        'Update billing Duration': [`p(95)<${duration}`],
        'Update billing Fail Rate': [`rate<${rate}`],
        'Delete shipping Duration': [`p(95)<${duration}`],
        'Delete shipping Fail Rate': [`rate<${rate}`],
        'Delete billing Duration': [`p(95)<${duration}`],
        'Delete billing Fail Rate': [`rate<${rate}`]
    }
}

export function setup() {
    let userCookies = helper.getCookies()
    return { cookies: userCookies }
}

export default function (data) {
    let jar = http.cookieJar()
    jar.set(__ENV.HOST, 'leflair.connect.sid', JSON.parse(data.cookies)['leflair.connect.sid'][0].value)

    group('GET / get addresses API', () => {
        let res = http.get(__ENV.HOST + config.api.addresses)

        let checkRes = globalChecks(res, duration)
        
        GetAddressesFailRate.add(!checkRes)
        GetAddressesDuration.add(res.timings.duration)
        GetAddressesReqs.add(1)

        sleep(1)
    })

    group('POST / add address API', () => {
        let body = {
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
        }

        let res = http.post(__ENV.HOST + config.api.addresses, JSON.stringify(body),
            { headers: { "Content-Type": "application/json" } })

        let checkRes = globalChecks(res, duration)
        
        AddAddressFailRate.add(!checkRes)
        AddAddressDuration.add(res.timings.duration)
        AddAddressReqs.add(1)

        sleep(1)
    })

    group('PUT / update shipping address API', () => {
        let addresses = http.get(__ENV.HOST + config.api.addresses)
        let shipping = JSON.parse(addresses.body).shipping

        let body = {
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
        }

        let res = http.put(__ENV.HOST + config.api.addresses + '/' + shipping[0].id,
            JSON.stringify(body),
            { headers: { "Content-Type": "application/json" } })

        let checkRes = globalChecks(res, duration)
        
        UpdateShippingFailRate.add(!checkRes)
        UpdateShippingDuration.add(res.timings.duration)
        UpdateShippingReqs.add(1)

        sleep(1)
    })

    group('PUT / update billing address API', () => {
        let addresses = http.get(__ENV.HOST + config.api.addresses)
        let billing = JSON.parse(addresses.body).billing

        let body = {
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
        }

        let res = http.put(__ENV.HOST + config.api.addresses + '/' + billing[0].id,
            JSON.stringify(body),
            { headers: { "Content-Type": "application/json" } })

        let checkRes = globalChecks(res, duration)
        
        UpdateBillingFailRate.add(!checkRes)
        UpdateBillingDuration.add(res.timings.duration)
        UpdateBillingReqs.add(1)

        sleep(1)
    })

    group('DELETE / delete shipping address API', () => {
        let addresses = http.get(__ENV.HOST + config.api.addresses)
        let shipping = JSON.parse(addresses.body).shipping

        let res = http.del(__ENV.HOST + config.api.addresses + '/' + shipping[0].id)

        let checkRes = globalChecks(res, duration)
        
        DeleteShippingFailRate.add(!checkRes)
        DeleteShippingDuration.add(res.timings.duration)
        DeleteShippingReqs.add(1)

        sleep(1)
    })

    group('DELETE / delete billing address API', () => {
        let addresses = http.get(__ENV.HOST + config.api.addresses)
        let billing = JSON.parse(addresses.body).billing

        let res = http.del(__ENV.HOST + config.api.addresses + '/' + billing[0].id)

        let checkRes = globalChecks(res, duration)
        
        DeleteBillingFailRate.add(!checkRes)
        DeleteBillingDuration.add(res.timings.duration)
        DeleteBillingReqs.add(1)

        sleep(1)
    })
}