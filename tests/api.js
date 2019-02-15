// import { config, Helper } from '../common/index.js'
import { config } from '../common/config.js'
import * as helper from '../common/helper.js'
import { group, sleep } from 'k6'

import AccountTest from './api/account.js'
import { options as AccountOptions } from './api/account.js'
// import AddressesTest from './api/addresses.js'
// import { options as AddressesOptions } from './api/addresses.js'
import BestSellersTest from './api/bestSellers.js'
import { options as BestSellersOptions } from './api/bestSellers.js'
import BrandsTest from './api/brands.js'
import { options as BrandsOptions } from './api/brands.js'
import CartTest from './api/cart.js'
import { options as CartOptions } from './api/cart.js'
import CateMenuTest from './api/cateMenu.js'
import { options as CateMenuOptions } from './api/cateMenu.js'
import HomeTest from './api/home.js'
import { options as HomeOptions } from './api/home.js'
// import OrdersTest from './api/orders.js'
// import { options as OrdersOptions } from './api/orders.js'
import ProductsTest from './api/products.js'
import { options as ProductsOptions } from './api/products.js'
import SalesTest from './api/sales.js'
import { options as SalesOptions } from './api/sales.js'
import SignInOutTest from './api/signInOut.js'
import { options as SignInOutOptions } from './api/signInOut.js'
import SignUpTest from './api/signUp.js'
import { options as SignUpOptions } from './api/signUp.js'
import GiftCardTest from './api/giftcard.js'
import { options as GiftCardOptions } from './api/giftcard.js'
import VoucherTest from './api/voucher.js'
import { options as VoucherOptions } from './api/voucher.js'

export function setup() {
    let userCookies = helper.getCookies()
    // let userOrders = helper.getOrders()
    let brandList = helper.getBrandList()
    let productInfo = helper.getProduct()
    let saleInfo = helper.getSale()
    let saleList = helper.getSales()

    return {
        cookies: userCookies,
        // orders: userOrders,
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
// Object.entries(OrdersOptions.thresholds).forEach(item => optionsSum[item[0]] = item[1])
Object.entries(ProductsOptions.thresholds).forEach(item => optionsSum[item[0]] = item[1])
Object.entries(SalesOptions.thresholds).forEach(item => optionsSum[item[0]] = item[1])
Object.entries(SignInOutOptions.thresholds).forEach(item => optionsSum[item[0]] = item[1])
Object.entries(SignUpOptions.thresholds).forEach(item => optionsSum[item[0]] = item[1])
Object.entries(GiftCardOptions.thresholds).forEach(item => optionsSum[item[0]] = item[1])
Object.entries(VoucherOptions.thresholds).forEach(item => optionsSum[item[0]] = item[1])

export let options = {
    setupTimeout: '60s',
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

    // group('Orders', () => {
    //     OrdersTest(data)
    // })

    group('Products', () => {
        ProductsTest(data)
    })

    group('Sales', () => {
        SalesTest(data)
    })

    group('Sign in & sign out', () => {
        SignInOutTest()
    })

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