import config from '../common/config.js'
import http from 'k6/http'
import { check, sleep, group } from 'k6'
import { Trend, Rate, Counter } from 'k6/metrics'
import faker from 'cdnjs.com/libraries/Faker'

export let GetAddressesDuration = new Trend('Get addresses Duration')
export let AddAddressDuration = new Trend('Add address Duration')
export let UpdateShippingDuration = new Trend('Update shipping Duration')
export let UpdateBillingDuration = new Trend('Update billing Duration')
export let DeleteShippingDuration = new Trend('Delete shipping Duration')
export let DeleteBillingDuration = new Trend('Delete billing Duration')

export let GetAddressesChecks = new Rate('Get addressess Checks')
export let AddAddressChecks = new Rate('Add address Checks')
export let UpdateShippingChecks = new Rate('Update shipping Checks')
export let UpdateBillingChecks = new Rate('Update billing Checks')
export let DeleteShippingChecks = new Rate('Delete shipping Checks')
export let DeleteBillingChecks = new Rate('Delete billing Checks')

export let GetAddressesReqs = new Counter('Get addresses Requests')
export let AddAddressReqs = new Counter('Add address Requests')
export let UpdateShippingReqs = new Counter('Update shipping Requests')
export let UpdateBillingReqs = new Counter('Update billing Requests')
export let DeleteShippingReqs = new Counter('Delete shipping Requests')
export let DeleteBillingReqs = new Counter('Delete billing Requests')

export let options = {
    vus: 10,
    duration: '30s',
    thresholds: {
        'Get addresses Duration': ['p(95)<500'],
        'Add address Duration': ['p(95)<500'],
        'Update shipping Duration': ['p(95)<500'],
        'Update billing Duration': ['p(95)<500'],
        'Delete shipping Duration': ['p(95)<500'],
        'Delete billing Duration': ['p(95)<500']
    }
}

export function setup() {
    let res = http.post(__ENV.HOST + config.api.signIn, {
        'email': config.testAccount.email, 'password': config.testAccount.password
    })
    return JSON.stringify(res.cookies)
}

export default function (data) {
    group('GET / get addresses API', () => {
        let jar = http.cookieJar()
        jar.set(__ENV.HOST, 'leflair.connect.sid', JSON.parse(data)['leflair.connect.sid'][0].value)

        let res = http.get(__ENV.HOST + config.api.addresses)

        check(res, {
            'status is 200': res => res.status == 200,
            'transaction time is less than 500ms': res => res.timings.duration < 500
        }) || GetAddressesChecks.add(1)
        GetAddressesDuration.add(res.timings.duration)
        GetAddressesReqs.add(1)

        sleep(1)
    })

    group('POST / add address API', () => {
        let jar = http.cookieJar()
        jar.set(__ENV.HOST, 'leflair.connect.sid', JSON.parse(data)['leflair.connect.sid'][0].value)

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

        check(res, {
            'status is 200': res => res.status == 200,
            'transaction time is less than 500ms': res => res.timings.duration < 500
        }) || AddAddressChecks.add(1)
        AddAddressDuration.add(res.timings.duration)
        AddAddressReqs.add(1)

        sleep(1)
    })

    group('PUT / update shipping address API', () => {
        let jar = http.cookieJar()
        jar.set(__ENV.HOST, 'leflair.connect.sid', JSON.parse(data)['leflair.connect.sid'][0].value)

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

        check(res, {
            'status is 200': res => res.status == 200,
            'transaction time is less than 500ms': res => res.timings.duration < 500
        }) || UpdateShippingChecks.add(1)
        UpdateShippingDuration.add(res.timings.duration)
        UpdateShippingReqs.add(1)

        sleep(1)
    })

    group('PUT / update billing address API', () => {
        let jar = http.cookieJar()
        jar.set(__ENV.HOST, 'leflair.connect.sid', JSON.parse(data)['leflair.connect.sid'][0].value)

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

        check(res, {
            'status is 200': res => res.status == 200,
            'transaction time is less than 500ms': res => res.timings.duration < 500
        }) || UpdateBillingChecks.add(1)
        UpdateBillingDuration.add(res.timings.duration)
        UpdateBillingReqs.add(1)

        sleep(1)
    })

    group('DELETE / delete shipping address API', () => {
        let jar = http.cookieJar()
        jar.set(__ENV.HOST, 'leflair.connect.sid', JSON.parse(data)['leflair.connect.sid'][0].value)

        let addresses = http.get(__ENV.HOST + config.api.addresses)
        let shipping = JSON.parse(addresses.body).shipping

        let res = http.del(__ENV.HOST + config.api.addresses + '/' + shipping[0].id)

        check(res, {
            'status is 200': res => res.status == 200,
            'transaction time is less than 500ms': res => res.timings.duration < 500
        }) || DeleteShippingChecks.add(1)
        DeleteShippingDuration.add(res.timings.duration)
        DeleteShippingReqs.add(1)

        sleep(1)
    })

    group('DELETE / delete billing address API', () => {
        let jar = http.cookieJar()
        jar.set(__ENV.HOST, 'leflair.connect.sid', JSON.parse(data)['leflair.connect.sid'][0].value)

        let addresses = http.get(__ENV.HOST + config.api.addresses)
        let billing = JSON.parse(addresses.body).billing

        let res = http.del(__ENV.HOST + config.api.addresses + '/' + billing[0].id)

        check(res, {
            'status is 200': res => res.status == 200,
            'transaction time is less than 500ms': res => res.timings.duration < 500
        }) || DeleteBillingChecks.add(1)
        DeleteBillingDuration.add(res.timings.duration)
        DeleteBillingReqs.add(1)

        sleep(1)
    })
}