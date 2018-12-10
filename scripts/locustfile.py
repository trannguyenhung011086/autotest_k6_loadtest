import logging
from configs import *
from locust import HttpLocust, TaskSet, task
import json
from faker import Faker
fake = Faker()
import requests

# class MyTaskSet(TaskSet):
#     @task
#     class SubTaskSet(TaskSet):
#         @task
#         def my_task(self):
#             pass


def get_brands():
    brands = []
    brand_ids = []
    result = {}
    r = requests.get(TARGET + "/api/v2/brands")
    r = r.json()

    for letter in r.keys():
        for item in r[letter]:
            brands.append(item["slug"])
            brand_ids.append(item["id"])

    result["brands"] = brands
    result["brand_ids"] = brand_ids

    return result


def get_today_sales():
    sales = []
    sale_ids = []
    result = {}
    r = requests.get(TARGET + "/api/v2/home/today")
    r = r.json()

    for sale in r:
        sales.append(sale["slug"])
        sale_ids.append(sale["id"])

    result["sales"] = sales
    result["sale_ids"] = sale_ids

    return result


def get_featured_sales():
    sales = []
    sale_ids = []
    result = {}
    r = requests.get(TARGET + "/api/v2/home/featured")
    r = r.json()

    for sale in r:
        sales.append(sale["slug"])
        sale_ids.append(sale["id"])

    result["sales"] = sales
    result["sale_ids"] = sale_ids

    return result


def get_upcoming_sales():
    sales = []
    r = requests.get(TARGET + "/api/v2/home/upcoming")
    r = r.json()

    for date in r:
        for sale in date["sales"]:
            sales.append(sale["slug"])

    return sales


def get_sales_products(sale_id):
    products = []
    r = requests.get(TARGET + "/api/v2/sales/" + sale_id)
    r = r.json()

    for product in r["products"]:
        products.append(product["slug"])

    return products


class WebTasks(TaskSet):

    @task
    def view_home(self):
        self.client.get("/vn")
        self.client.get("/en")

    @task
    def view_categories(self):
        categories = ["/vn/categories/thoi-trang-5b56d3448f0dd7c0480acd1b",
                      "/vn/categories/tui-xach-and-giay-dep-5b56d3448f0dd7c0480acd1f",
                      "/vn/categories/phu-kien-5b56d3448f0dd7c0480acd28",
                      "/vn/categories/suc-khoe-and-lam-dep-5b56d3448f0dd7c0480acd32",
                      "/vn/categories/nha-cua-and-doi-song-5b62d1008f0dd7c0480acd5b",
                      "/vn/categories/international"]
        for category in categories:
            self.client.get(category)

    @task
    def view_brands(self):
        brands = get_brands()["brands"]
        for brand in brands:
            self.client.get("/vn/brands/" + brand)

    @task
    def view_featured_sales(self):
        sales = get_featured_sales()["sales"]
        for sale in sales:
            self.client.get("/vn/sales/" + sale)

    @task
    def view_today_sales(self):
        sales = get_today_sales()["sales"]
        for sale in sales:
            self.client.get("/vn/sales/" + sale)

    @task
    def view_upcoming_sales(self):
        sales = get_upcoming_sales()
        for sale in sales:
            self.client.get("/vn/sales/upcoming/" + sale)

    @task
    def view_products(self):
        sale_ids = get_today_sales()["sale_ids"]
        for sale_id in sale_ids:
            products = get_sales_products(sale_id)
            for product in products:
                self.client.get("/vn/products/" + product)


class ApiTasks(TaskSet):
    email = "NOT_FOUND"
    password = "NOT_FOUND"

    def on_start(self):
        if len(USER_CREDENTIALS) > 0:
            self.email, self.password = USER_CREDENTIALS.pop()

    @task
    def login(self):
        response = self.client.post("/api/v2/account/signin", {
            'email': self.email, 'password': self.password
        })
        logging.info('Login with %s email and %s password',
                     self.email, self.password)
        logging.info(response.text)

    @task
    def signup(self):
        signup_data = {"email": fake.email(),
                       "password": fake.password(), "language": "en", "gender": "F"}

        response = self.client.post("/api/v2/account/signup", data=signup_data)
        logging.info(response.text)

    @task
    def check_giftcard_invalid(self):
        response = self.client.get("/api/v2/giftcards/giftcardcode")
        logging.info(response.text)

    @task
    def check_voucher_invalid(self):
        response = self.client.get("/api/v2/vouchers/vouchercode")
        logging.info(response.text)


class WebTest(HttpLocust):
    host = TARGET
    task_set = WebTasks
    min_wait = 5000
    max_wait = 15000


class ApiTest(HttpLocust):
    host = TARGET
    task_set = ApiTasks
    min_wait = 5000
    max_wait = 15000
