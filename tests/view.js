import * as helper from '../common/helper.js'
import { group, sleep } from 'k6'

import BrandsTest from './view/brands.js'
import { options as BrandsOptions } from './view/brands.js'
import CategoryTest from './view/category.js'
import { options as CategoryOptions } from './view/category.js'
import HomeTest from './view/home.js'
import { options as HomeOptions } from './view/home.js'
import ProductsTest from './view/products.js'
import { options as ProductsOptions } from './view/products.js'
import SalesTest from './view/sales.js'
import { options as SalesOptions } from './view/sales.js'

export function setup() {
    let brandList = helper.getBrandList()
    let saleInfo = helper.getSale()
    let saleList = helper.getSales()

    return {
        brands: brandList,
        sale: saleInfo,
        sales: saleList
    }
}

let optionsSum = {}
Object.entries(BrandsOptions.thresholds).forEach(item => optionsSum[item[0]] = item[1])
Object.entries(CategoryOptions.thresholds).forEach(item => optionsSum[item[0]] = item[1])
Object.entries(HomeOptions.thresholds).forEach(item => optionsSum[item[0]] = item[1])
Object.entries(ProductsOptions.thresholds).forEach(item => optionsSum[item[0]] = item[1])
Object.entries(SalesOptions.thresholds).forEach(item => optionsSum[item[0]] = item[1])

export let options = {
    setupTimeout: '60s',
    thresholds: optionsSum
}

export default (data) => {
    group('Brands', () => {
        BrandsTest(data)
    })

    group('Category', () => {
        CategoryTest()
    })

    group('Home', () => {
        HomeTest()
    })

    group('Products', () => {
        ProductsTest(data)
    })

    group('Sales', () => {
        SalesTest(data)
    })

    sleep(1)
}