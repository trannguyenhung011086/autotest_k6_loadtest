import { check } from 'k6'

export default function (res, duration, status = 200) {
    return check(res, {
        'status is correct': r => r.status == status,
        'transaction time is less than threshold': r => r.timings.duration < duration
    })
}