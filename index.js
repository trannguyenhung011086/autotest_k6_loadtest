import config from './common/config.js'
import http from 'k6/http'
import { group, sleep } from 'k6'

import AccountTest from './tests/account.js'
import { options as AccountOptions } from './tests/account.js'
import AddressTest from './tests/addresses.js'
import { options as AddressOptions } from './tests/addresses.js'
import BestSellersTest from './tests/bestSellers.js'
import { options as BestSellersOptions } from './tests/bestSellers.js'

export function setup() {
    let res = http.post(__ENV.HOST + config.api.signIn, {
        "email": config.testAccount.email, "password": config.testAccount.password
    })
    return {
        cookies: JSON.stringify(res.cookies)
    }
}

let optionsSum = {}
Object.entries(AccountOptions.thresholds).forEach(item => optionsSum[item[0]] = item[1])
Object.entries(AddressOptions.thresholds).forEach(item => optionsSum[item[0]] = item[1])
Object.entries(BestSellersOptions.thresholds).forEach(item => optionsSum[item[0]] = item[1])

export let options = {
    thresholds: optionsSum
}

export default (data) => {
    group('Account', () => {
        AccountTest(data)
    })

    group('Address', () => {
        AddressTest(data)
    })

    group('Bestsellers', () => {
        BestSellersTest()
    })

    sleep(1)
}