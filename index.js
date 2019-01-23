import * as helper from './common/helper.js'
import { group, sleep } from 'k6'

import AccountTest from './tests/account.js'
import { options as AccountOptions } from './tests/account.js'
// import AddressesTest from './tests/addresses.js'
// import { options as AddressesOptions } from './tests/addresses.js'
import BestSellersTest from './tests/bestSellers.js'
import { options as BestSellersOptions } from './tests/bestSellers.js'
import BrandsTest from './tests/brands.js'
import { options as BrandsOptions } from './tests/brands.js'
import CartTest from './tests/cart.js'
import { options as CartOptions } from './tests/cart.js'
import CateMenuTest from './tests/cateMenu.js'
import { options as CateMenuOptions } from './tests/cateMenu.js'
import HomeTest from './tests/home.js'
import { options as HomeOptions } from './tests/home.js'
import OrdersTest from './tests/orders.js'
import { options as OrdersOptions } from './tests/orders.js'
import ProductsTest from './tests/products.js'
import { options as ProductsOptions } from './tests/products.js'
// import SalesTest from './tests/sales.js'
// import { options as SalesOptions } from './tests/sales.js'
// import SignInOutTest from './tests/signInOut.js'
// import { options as SignInOutOptions } from './tests/signInOut.js'
import SignUpTest from './tests/signUp.js'
import { options as SignUpOptions } from './tests/signUp.js'
import GiftCardTest from './tests/giftcard.js'
import { options as GiftCardOptions } from './tests/giftcard.js'
import VoucherTest from './tests/voucher.js'
import { options as VoucherOptions } from './tests/voucher.js'

export function setup() {
    let userCookies = helper.getCookies()
    let brandList = helper.getBrandList()
    let productInfo = helper.getProduct()
    let saleInfo = helper.getSale()
    let saleList = helper.getSales()

    return {
        cookies: userCookies,
        brands: brandList,
        product: productInfo,
        sale: saleInfo,
        sales: saleList
    }
}

let optionsSum = {}
Object.entries(AccountOptions.thresholds).forEach(item => optionsSum[item[0]] = item[1])
// Object.entries(AddressesOptions.thresholds).forEach(item => optionsSum[item[0]] = item[1])
Object.entries(BestSellersOptions.thresholds).forEach(item => optionsSum[item[0]] = item[1])
Object.entries(BrandsOptions.thresholds).forEach(item => optionsSum[item[0]] = item[1])
Object.entries(CartOptions.thresholds).forEach(item => optionsSum[item[0]] = item[1])
Object.entries(CateMenuOptions.thresholds).forEach(item => optionsSum[item[0]] = item[1])
Object.entries(HomeOptions.thresholds).forEach(item => optionsSum[item[0]] = item[1])
Object.entries(OrdersOptions.thresholds).forEach(item => optionsSum[item[0]] = item[1])
Object.entries(ProductsOptions.thresholds).forEach(item => optionsSum[item[0]] = item[1])
// Object.entries(SalesOptions.thresholds).forEach(item => optionsSum[item[0]] = item[1])
// Object.entries(SignInOutOptions.thresholds).forEach(item => optionsSum[item[0]] = item[1])
Object.entries(SignUpOptions.thresholds).forEach(item => optionsSum[item[0]] = item[1])
Object.entries(GiftCardOptions.thresholds).forEach(item => optionsSum[item[0]] = item[1])
Object.entries(VoucherOptions.thresholds).forEach(item => optionsSum[item[0]] = item[1])

export let options = {
    thresholds: optionsSum
}

export default (data) => {
    group('Account', () => {
        AccountTest(data)
    })

    // group('Addresses', () => {
    //     AddressesTest(data)
    // })

    group('Bestsellers', () => {
        BestSellersTest()
    })

    group('Brands', () => {
        BrandsTest(data)
    })

    group('Cart', () => {
        CartTest(data)
    })

    group('Category menu', () => {
        CateMenuTest()
    })

    group('Home', () => {
        HomeTest()
    })

    group('Orders', () => {
        OrdersTest(data)
    })

    group('Products', () => {
        ProductsTest(data)
    })

    // group('Sales', () => {
    //     SalesTest(data)
    // })

    // group('Sign in & sign out', () => {
    //     SignInOutTest()
    // })

    group('Sign up', () => {
        SignUpTest()
    })

    group('Gift card', () => {
        GiftCardTest(data)
    })

    group('Voucher', () => {
        VoucherTest(data)
    })

    sleep(1)
}