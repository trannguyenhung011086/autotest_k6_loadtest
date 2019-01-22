# Load test with k6
- install https://docs.k6.io/docs/installation
- run with constant VUs: `k6 run -e HOST=https://www.testing.leflair.io --vus 10 --duration 10s tests/signUp.js`
- run with rampage VUs: `k6 run -e HOST=https://www.testing.leflair.io --stage 5m:10,20m:100,5m:10 tests/signUp.js`

## Key metrics (https://docs.k6.io/docs/result-metrics)
- **http_reqs**: total requests generated & total request per second (more is better)
- **http_req_duration**: total time for server to process a request and respond completely (less is better)
(equal to http_req_sending + http_req_waiting + http_req_receiving)
- **vus**: number of virtual concurrent users generated
- **iterations**: number of times the VUs executing the script
- **checks**: number of failed checks

*Notes*
- more info about thresholds https://support.loadimpact.com/4.0/test-scripting/thresholds/
- to use debug mode, run: `k6 run --http-debug script.js` / `k6 run --http-debug="full" script.js`