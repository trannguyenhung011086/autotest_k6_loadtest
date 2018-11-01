# Load test with Locust
- pip3 install locustio

## Run as standalone
- run all tests: `locust -f scripts/locustfile.py`
- run client tests: `locust -f scripts/locustfile.py WebTest`
- run API tests: `locust -f scripts/locustfile.py ApiTest`

## Run as master and slave
- start master: `locust -f scripts/locustfile.py --master`
- start slave: `locust -f scripts/locustfile.py --slave`

## Start load test
- go to https://localhost:8089
- input total users to swarm and hatch rate