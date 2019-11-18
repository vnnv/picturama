import moment from 'moment'  // This includes locale 'en'
import 'moment/locale/de'

import text_de from './text_de'
import text_en from './text_en'
import text_es from './text_es'
import text_bg from './text_bg'

export type Locale = 'de' | 'en' | 'es' | 'bg'
export const locales = [ 'de', 'en', 'es', 'bg']

export const fallbackLocale: Locale = 'en'
export type I18nKey = keyof typeof text_en

const textsByLang: { [K in Locale]: { [K in I18nKey]: string } } = {
    de: text_de,
    en: text_en,
    es: text_es as any,
    bg: text_bg as any,
}

const msgFormatRe = /\{(\d+)\}/g
const msgSplitRe = /(\{\d+\})/g


let locale: Locale

export function setLocale(newLocale: string) {
    if (newLocale.length > 2) {
        newLocale = newLocale.substr(0, 2)
    }
    if (locales.indexOf(newLocale) === -1) {
        newLocale = fallbackLocale
    }

    locale = newLocale as Locale
    moment.locale(locale)
}

export function getLocale(): string {
    return locale
}

export function msg(key: I18nKey, ...args: any[]): string {
    if (!locale) {
        throw new Error('msg was called before locale was set')
    }

    let text: string | undefined = textsByLang[locale][key]
    if (!text) {
        console.error(`Missing I18N key for ${locale}: ${key}`)
        text = textsByLang[fallbackLocale][key]
        if (!text) {
            return `[${key}]`
        }
    }

    if (args && args.length > 0) {
        return text.replace(msgFormatRe, (match, group1) => args[parseInt(group1)])
    } else {
        return text
    }
}

export function splitMsg(key: I18nKey): string[] {
    return msg(key).split(msgSplitRe)
}
