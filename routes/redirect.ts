/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'

import * as challengeUtils from '../lib/challengeUtils'
import { challenges } from '../data/datacache'
import * as security from '../lib/insecurity'
import * as utils from '../lib/utils'

// --- Початок виправлення ---

// 1. Створюємо "білий список" (allow-list) дозволених редиректів
const allowedRedirects: Record<string, string> = {
    dashExplorer: 'https://explorer.dash.org/address/Xr556RzuwX6hg5EGpkybbv5RanJoZN17kW',
    btcExplorer: 'https://blockchain.info/address/1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm',
    ethExplorer: 'https://etherscan.io/address/0x0f933ab9fcaaa782d0279c300d73750e1311eae6'
}

export function performRedirect () {
    return ({ query }: Request, res: Response, next: NextFunction) => {
        // 2. Приймаємо "ключ" редиректу, а не повний URL
        const toParam: string = query.to as string

        // 3. Шукаємо реальний URL у нашому безпечному списку
        const toUrl: string = allowedRedirects[toParam]

        // 4. Робимо редирект, ТІЛЬКИ якщо ключ знайдено у списку
        if (toUrl) {
            challengeUtils.solveIf(challenges.redirectCryptoCurrencyChallenge, () => {
                // 5. Перевірка для челенджу тепер посилається на значення з нашого списку
                return  toUrl === allowedRedirects.dashExplorer ||
                        toUrl === allowedRedirects.btcExplorer ||
                        toUrl === allowedRedirects.ethExplorer
            })
            challengeUtils.solveIf(challenges.redirectChallenge, () => { return isUnintendedRedirect(toUrl) })
            res.redirect(toUrl)
        } else {
            // 6. Якщо ключ не знайдено, це невалідна спроба редиректу
            res.status(406)
            next(new Error('Unrecognized target URL for redirect: ' + toParam))
        }
    }
}

function isUnintendedRedirect (toUrl: string) {
  let unintended = true
  for (const allowedUrl of security.redirectAllowlist) {
    unintended = unintended && !utils.startsWith(toUrl, allowedUrl)
  }
  return unintended
}
