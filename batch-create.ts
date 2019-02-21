import fetch, { RequestInit } from 'node-fetch'
import colors from 'colors'
import yargs from 'yargs';

const argv = yargs
    .option('partnerId', {
        alias: 'i',
        string: true,
        demand: true
    })
    .option('partnerToken', {
        alias: 't',
        string: true,
        demand: true
    })
    .option('count', {
        alias: 'c',
        default: 1,
        demand: false
    }).argv

interface StringMap { [s: string]: string }

async function runBatch(partnerId: string, partnerToken: string, count: number) {
    const url = `https://api.dev.unloc.app/v1/partners/${partnerId}/batch/keys`
    const headers: StringMap = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + partnerToken
    }
    const keys = new Array(count)
    for (let i = 0; i < count; i++) {
        keys[i] = key(`Message number ${i}`)
    }
    const options: RequestInit = {
        method: 'post',
        headers: headers,
        timeout: 30 * 1000, // ms
        body: JSON.stringify({ 'keys': keys })
    }
    const res = await fetch(url, options)
    const json = await res.json()
    if (!res.ok) {
        throw new Error(json.error)
    }
    return json.ids
}

function key(message: string): object {
    const start = new Date()
    const end = new Date()
    end.setDate(end.getHours() + 1)

    return {
        lockId: 'virtual-123',
        start: start.toISOString(),
        end: end.toISOString(),
        message: message
    }
}

async function main(partnerId: string, partnerToken: string, count: number) {
    console.log(`Batch creating ${count} keys...`.yellow)
    const keyIds = await runBatch(partnerId, partnerToken, count)
    return `Got ${keyIds.length} keys`
}

main(argv.partnerId, argv.partnerToken, argv.count)
    .then(msg => {
        console.log(colors.green(msg))
    })
    .catch(err => {
        console.log(colors.red(err.message))
    })