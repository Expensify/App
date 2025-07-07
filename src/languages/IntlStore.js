"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var date_fns_1 = require("date-fns");
var react_native_onyx_1 = require("react-native-onyx");
var extractModuleDefaultExport_1 = require("@libs/extractModuleDefaultExport");
var LOCALES_1 = require("@src/CONST/LOCALES");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var flattenObject_1 = require("./flattenObject");
// This function was added here to avoid circular dependencies
function setAreTranslationsLoading(areTranslationsLoading) {
    // eslint-disable-next-line rulesdir/prefer-actions-set-data
    react_native_onyx_1.default.set(ONYXKEYS_1.default.ARE_TRANSLATIONS_LOADING, areTranslationsLoading);
}
var IntlStore = /** @class */ (function () {
    function IntlStore() {
    }
    IntlStore.getCurrentLocale = function () {
        return this.currentLocale;
    };
    IntlStore.load = function (locale) {
        var _this = this;
        if (this.currentLocale === locale) {
            return Promise.resolve();
        }
        var loaderPromise = this.loaders[locale];
        setAreTranslationsLoading(true);
        return loaderPromise()
            .then(function () {
            _this.currentLocale = locale;
            // Set the default date-fns locale
            var dateUtilsLocale = _this.dateUtilsCache.get(locale);
            if (dateUtilsLocale) {
                (0, date_fns_1.setDefaultOptions)({ locale: dateUtilsLocale });
            }
        })
            .then(function () {
            setAreTranslationsLoading(false);
        });
    };
    IntlStore.get = function (key, locale) {
        var _a;
        var localeToUse = locale && this.cache.has(locale) ? locale : this.currentLocale;
        if (!localeToUse) {
            return null;
        }
        var translations = this.cache.get(localeToUse);
        return (_a = translations === null || translations === void 0 ? void 0 : translations[key]) !== null && _a !== void 0 ? _a : null;
    };
    var _b;
    _b = IntlStore;
    IntlStore.currentLocale = undefined;
    /**
     * Cache for translations
     */
    IntlStore.cache = new Map();
    /**
     * Cache for localized date-fns
     * @private
     */
    IntlStore.dateUtilsCache = new Map();
    /**
     * Set of loaders for each locale.
     * Note that this can't be trivially DRYed up because dynamic imports must use string literals in metro: https://github.com/facebook/metro/issues/52
     */
    IntlStore.loaders = (_a = {},
        _a[LOCALES_1.LOCALES.DE] = function () {
            return _b.cache.has(LOCALES_1.LOCALES.DE)
                ? Promise.all([Promise.resolve(), Promise.resolve()])
                : Promise.all([
                    Promise.resolve().then(function () { return require('./de'); }).then(function (module) {
                        _b.cache.set(LOCALES_1.LOCALES.DE, (0, flattenObject_1.default)((0, extractModuleDefaultExport_1.default)(module)));
                    }),
                    Promise.resolve().then(function () { return require('date-fns/locale/de'); }).then(function (module) {
                        _b.dateUtilsCache.set(LOCALES_1.LOCALES.DE, module.de);
                    }),
                ]);
        },
        _a[LOCALES_1.LOCALES.EN] = function () {
            return _b.cache.has(LOCALES_1.LOCALES.EN)
                ? Promise.all([Promise.resolve(), Promise.resolve()])
                : Promise.all([
                    Promise.resolve().then(function () { return require('./en'); }).then(function (module) {
                        _b.cache.set(LOCALES_1.LOCALES.EN, (0, flattenObject_1.default)((0, extractModuleDefaultExport_1.default)(module)));
                    }),
                    Promise.resolve().then(function () { return require('date-fns/locale/en-GB'); }).then(function (module) {
                        _b.dateUtilsCache.set(LOCALES_1.LOCALES.EN, module.enGB);
                    }),
                ]);
        },
        _a[LOCALES_1.LOCALES.ES] = function () {
            return _b.cache.has(LOCALES_1.LOCALES.ES)
                ? Promise.all([Promise.resolve(), Promise.resolve()])
                : Promise.all([
                    Promise.resolve().then(function () { return require('./es'); }).then(function (module) {
                        _b.cache.set(LOCALES_1.LOCALES.ES, (0, flattenObject_1.default)((0, extractModuleDefaultExport_1.default)(module)));
                    }),
                    Promise.resolve().then(function () { return require('date-fns/locale/es'); }).then(function (module) {
                        _b.dateUtilsCache.set(LOCALES_1.LOCALES.ES, module.es);
                    }),
                ]);
        },
        _a[LOCALES_1.LOCALES.FR] = function () {
            return _b.cache.has(LOCALES_1.LOCALES.FR)
                ? Promise.all([Promise.resolve(), Promise.resolve()])
                : Promise.all([
                    Promise.resolve().then(function () { return require('./fr'); }).then(function (module) {
                        _b.cache.set(LOCALES_1.LOCALES.FR, (0, flattenObject_1.default)((0, extractModuleDefaultExport_1.default)(module)));
                    }),
                    Promise.resolve().then(function () { return require('date-fns/locale/fr'); }).then(function (module) {
                        _b.dateUtilsCache.set(LOCALES_1.LOCALES.FR, module.fr);
                    }),
                ]);
        },
        _a[LOCALES_1.LOCALES.IT] = function () {
            return _b.cache.has(LOCALES_1.LOCALES.IT)
                ? Promise.all([Promise.resolve(), Promise.resolve()])
                : Promise.all([
                    Promise.resolve().then(function () { return require('./it'); }).then(function (module) {
                        _b.cache.set(LOCALES_1.LOCALES.IT, (0, flattenObject_1.default)((0, extractModuleDefaultExport_1.default)(module)));
                    }),
                    Promise.resolve().then(function () { return require('date-fns/locale/it'); }).then(function (module) {
                        _b.dateUtilsCache.set(LOCALES_1.LOCALES.IT, module.it);
                    }),
                ]);
        },
        _a[LOCALES_1.LOCALES.JA] = function () {
            return _b.cache.has(LOCALES_1.LOCALES.JA)
                ? Promise.all([Promise.resolve(), Promise.resolve()])
                : Promise.all([
                    Promise.resolve().then(function () { return require('./ja'); }).then(function (module) {
                        _b.cache.set(LOCALES_1.LOCALES.JA, (0, flattenObject_1.default)((0, extractModuleDefaultExport_1.default)(module)));
                    }),
                    Promise.resolve().then(function () { return require('date-fns/locale/ja'); }).then(function (module) {
                        _b.dateUtilsCache.set(LOCALES_1.LOCALES.JA, module.ja);
                    }),
                ]);
        },
        _a[LOCALES_1.LOCALES.NL] = function () {
            return _b.cache.has(LOCALES_1.LOCALES.NL)
                ? Promise.all([Promise.resolve(), Promise.resolve()])
                : Promise.all([
                    Promise.resolve().then(function () { return require('./nl'); }).then(function (module) {
                        _b.cache.set(LOCALES_1.LOCALES.NL, (0, flattenObject_1.default)((0, extractModuleDefaultExport_1.default)(module)));
                    }),
                    Promise.resolve().then(function () { return require('date-fns/locale/nl'); }).then(function (module) {
                        _b.dateUtilsCache.set(LOCALES_1.LOCALES.NL, module.nl);
                    }),
                ]);
        },
        _a[LOCALES_1.LOCALES.PL] = function () {
            return _b.cache.has(LOCALES_1.LOCALES.PL)
                ? Promise.all([Promise.resolve(), Promise.resolve()])
                : Promise.all([
                    Promise.resolve().then(function () { return require('./pl'); }).then(function (module) {
                        _b.cache.set(LOCALES_1.LOCALES.PL, (0, flattenObject_1.default)((0, extractModuleDefaultExport_1.default)(module)));
                    }),
                    Promise.resolve().then(function () { return require('date-fns/locale/pl'); }).then(function (module) {
                        _b.dateUtilsCache.set(LOCALES_1.LOCALES.PL, module.pl);
                    }),
                ]);
        },
        _a[LOCALES_1.LOCALES.PT_BR] = function () {
            return _b.cache.has(LOCALES_1.LOCALES.PT_BR)
                ? Promise.all([Promise.resolve(), Promise.resolve()])
                : Promise.all([
                    Promise.resolve().then(function () { return require('./pt-BR'); }).then(function (module) {
                        _b.cache.set(LOCALES_1.LOCALES.PT_BR, (0, flattenObject_1.default)((0, extractModuleDefaultExport_1.default)(module)));
                    }),
                    Promise.resolve().then(function () { return require('date-fns/locale/pt-BR'); }).then(function (module) {
                        _b.dateUtilsCache.set(LOCALES_1.LOCALES.PT_BR, module.ptBR);
                    }),
                ]);
        },
        _a[LOCALES_1.LOCALES.ZH_HANS] = function () {
            return _b.cache.has(LOCALES_1.LOCALES.ZH_HANS)
                ? Promise.all([Promise.resolve(), Promise.resolve()])
                : Promise.all([
                    Promise.resolve().then(function () { return require('./zh-hans'); }).then(function (module) {
                        _b.cache.set(LOCALES_1.LOCALES.ZH_HANS, (0, flattenObject_1.default)((0, extractModuleDefaultExport_1.default)(module)));
                    }),
                    Promise.resolve().then(function () { return require('date-fns/locale/zh-CN'); }).then(function (module) {
                        _b.dateUtilsCache.set(LOCALES_1.LOCALES.ZH_HANS, module.zhCN);
                    }),
                ]);
        },
        _a);
    return IntlStore;
}());
exports.default = IntlStore;
