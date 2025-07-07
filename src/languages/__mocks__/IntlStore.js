"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var LOCALES_1 = require("@src/CONST/LOCALES");
var flattenObject_1 = require("@src/languages/flattenObject");
var IntlStore = /** @class */ (function () {
    function IntlStore() {
    }
    IntlStore.getCurrentLocale = function () {
        return this.currentLocale;
    };
    IntlStore.load = function () {
        return Promise.resolve();
    };
    IntlStore.get = function (key, locale) {
        var _a;
        var localeToUse = locale && this.localeCache.has(locale) ? locale : this.currentLocale;
        if (!localeToUse) {
            return null;
        }
        var translations = this.localeCache.get(localeToUse);
        return (_a = translations === null || translations === void 0 ? void 0 : translations[key]) !== null && _a !== void 0 ? _a : null;
    };
    IntlStore.currentLocale = 'en';
    IntlStore.localeCache = new Map([
        [
            LOCALES_1.LOCALES.EN,
            (0, flattenObject_1.default)({
                testKey1: 'English',
                testKey2: 'Test Word 2',
                testKeyGroup: {
                    testFunction: function (_a) {
                        var testVariable = _a.testVariable;
                        return "With variable ".concat(testVariable);
                    },
                },
                pluralizationGroup: {
                    countWithoutPluralRules: function (_a) {
                        var count = _a.count;
                        return "Count value is ".concat(count);
                    },
                    countWithNoCorrespondingRule: function (_a) {
                        var count = _a.count;
                        return ({
                            one: 'One file is being downloaded.',
                            other: "Other ".concat(count, " files are being downloaded."),
                        });
                    },
                },
            }),
        ],
        [
            LOCALES_1.LOCALES.ES,
            (0, flattenObject_1.default)({
                testKey1: 'Spanish',
                testKey2: 'Spanish Word 2',
                pluralizationGroup: {
                    couthWithCorrespondingRule: function (_a) {
                        var count = _a.count;
                        return ({
                            one: 'Un artículo',
                            other: "".concat(count, " art\u00EDculos"),
                        });
                    },
                },
            }),
        ],
    ]);
    IntlStore.loaders = (_a = {},
        _a[LOCALES_1.LOCALES.EN] = function () {
            return Promise.all([Promise.resolve(), Promise.resolve()]);
        },
        _a[LOCALES_1.LOCALES.ES] = function () {
            return Promise.all([Promise.resolve(), Promise.resolve()]);
        },
        _a);
    return IntlStore;
}());
exports.default = IntlStore;
