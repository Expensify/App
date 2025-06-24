import {setDefaultOptions} from 'date-fns';
import type {Locale as DateFnsLocale} from 'date-fns';
import Log from '@libs/Log';
import {LOCALES} from '@src/CONST/LOCALES';
import type {Locale} from '@src/CONST/LOCALES';

/**
 * Similar to TranslationStore but for date-fns locales
 * Handles dynamic loading and caching of date-fns locale
 */
class DateLocaleStore {
    private static currentLocale?: Locale;

    private static cache = new Map<Locale, DateFnsLocale>();

    /**
     * Set of loaders for each locale.
     * Uses dynamic imports with caching to avoid loading all locales
     */
    private static loaders: Record<Locale, () => Promise<DateFnsLocale>> = {
        [LOCALES.DE]: () => {
            const cached = this.cache.get(LOCALES.DE);
            return cached
                ? Promise.resolve(cached)
                : import('date-fns/locale/de').then((module) => {
                      const locale = module.de;
                      this.cache.set(LOCALES.DE, locale);
                      return locale;
                  });
        },
        [LOCALES.EN]: () => {
            const cached = this.cache.get(LOCALES.EN);
            return cached
                ? Promise.resolve(cached)
                : import('date-fns/locale/en-GB').then((module) => {
                      const locale = module.enGB;
                      this.cache.set(LOCALES.EN, locale);
                      return locale;
                  });
        },
        [LOCALES.ES]: () => {
            const cached = this.cache.get(LOCALES.ES);
            return cached
                ? Promise.resolve(cached)
                : import('date-fns/locale/es').then((module) => {
                      const locale = module.es;
                      this.cache.set(LOCALES.ES, locale);
                      return locale;
                  });
        },
        [LOCALES.FR]: () => {
            const cached = this.cache.get(LOCALES.FR);
            return cached
                ? Promise.resolve(cached)
                : import('date-fns/locale/fr').then((module) => {
                      const locale = module.fr;
                      this.cache.set(LOCALES.FR, locale);
                      return locale;
                  });
        },
        [LOCALES.IT]: () => {
            const cached = this.cache.get(LOCALES.IT);
            return cached
                ? Promise.resolve(cached)
                : import('date-fns/locale/it').then((module) => {
                      const locale = module.it;
                      this.cache.set(LOCALES.IT, locale);
                      return locale;
                  });
        },
        [LOCALES.JA]: () => {
            const cached = this.cache.get(LOCALES.JA);
            return cached
                ? Promise.resolve(cached)
                : import('date-fns/locale/ja').then((module) => {
                      const locale = module.ja;
                      this.cache.set(LOCALES.JA, locale);
                      return locale;
                  });
        },
        [LOCALES.NL]: () => {
            const cached = this.cache.get(LOCALES.NL);
            return cached
                ? Promise.resolve(cached)
                : import('date-fns/locale/nl').then((module) => {
                      const locale = module.nl;
                      this.cache.set(LOCALES.NL, locale);
                      return locale;
                  });
        },
        [LOCALES.PL]: () => {
            const cached = this.cache.get(LOCALES.PL);
            return cached
                ? Promise.resolve(cached)
                : import('date-fns/locale/pl').then((module) => {
                      const locale = module.pl;
                      this.cache.set(LOCALES.PL, locale);
                      return locale;
                  });
        },
        [LOCALES.PT_BR]: () => {
            const cached = this.cache.get(LOCALES.PT_BR);
            return cached
                ? Promise.resolve(cached)
                : import('date-fns/locale/pt-BR').then((module) => {
                      const locale = module.ptBR;
                      this.cache.set(LOCALES.PT_BR, locale);
                      return locale;
                  });
        },
        [LOCALES.ZH_HANS]: () => {
            const cached = this.cache.get(LOCALES.ZH_HANS);
            return cached
                ? Promise.resolve(cached)
                : import('date-fns/locale/zh-CN').then((module) => {
                      const locale = module.zhCN;
                      this.cache.set(LOCALES.ZH_HANS, locale);
                      return locale;
                  });
        },
    };

    public static load(locale: Locale) {
        if (this.currentLocale === locale) {
            return Promise.resolve();
        }
        if (this.cache.has(locale)) {
            this.currentLocale = locale;
            setDefaultOptions({locale: this.cache.get(locale)});
            return Promise.resolve();
        }
        const loaderPromise = this.loaders[locale];
        return loaderPromise()
            .then((dateLocale: DateFnsLocale) => {
                this.currentLocale = locale;
                setDefaultOptions({locale: dateLocale});
            })
            .catch((error) => {
                Log.warn('Failed to load date locale, falling back to EN', {
                    locale,
                    error,
                });
                this.loaders[LOCALES.EN]().then((fallbackLocale) => {
                    this.currentLocale = LOCALES.EN;
                    setDefaultOptions({locale: fallbackLocale});
                });
            });
    }
}

export default DateLocaleStore;
