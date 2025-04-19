
const __extends =
    (this && this.__extends) ||
    (function () {
        let extendStatics = function (d, b) {
            extendStatics =
                Object.setPrototypeOf ||
                ({__proto__: []} instanceof Array &&
                    function (d, b) {
                        d.__proto__ = b;
                    }) ||
                function (d, b) {
                    for (const p in b) {if (Object.prototype.hasOwnProperty.call(b, p)) {d[p] = b[p];}}
                };
            return extendStatics(d, b);
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() {
                this.constructor = d;
            }
            d.prototype = b === null ? Object.create(b) : ((__.prototype = b.prototype), new __());
        };
    })();
exports.__esModule = true;
// eslint-disable-next-line no-restricted-imports
const expensify_common_1 = require('expensify-common');
const react_native_onyx_1 = require('react-native-onyx');
const ONYXKEYS_1 = require('@src/ONYXKEYS');
const Log_1 = require('./Log');

const accountIDToNameMap = {};
const reportIDToNameMap = {};
react_native_onyx_1['default'].connect({
    key: ONYXKEYS_1['default'].COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback (value) {
        if (!value) {
            return;
        }
        Object.values(value).forEach(function (report) {
            let _a;
            if (!report) {
                return;
            }
            reportIDToNameMap[report.reportID] = (_a = report.reportName) !== null && _a !== void 0 ? _a : report.reportID;
        });
    },
});
react_native_onyx_1['default'].connect({
    key: ONYXKEYS_1['default'].PERSONAL_DETAILS_LIST,
    callback (personalDetailsList) {
        Object.values(personalDetailsList !== null && personalDetailsList !== void 0 ? personalDetailsList : {}).forEach(function (personalDetails) {
            let _a; let _b;
            if (!personalDetails) {
                return;
            }
            accountIDToNameMap[personalDetails.accountID] =
                (_b = (_a = personalDetails.login) !== null && _a !== void 0 ? _a : personalDetails.displayName) !== null && _b !== void 0 ? _b : '';
        });
    },
});
const ExpensiMarkWithContext = /** @class */ (function (_super) {
    __extends(ExpensiMarkWithContext, _super);
    function ExpensiMarkWithContext() {
        return (_super !== null && _super.apply(this, arguments)) || this;
    }
    ExpensiMarkWithContext.prototype.htmlToMarkdown = function (htmlString, extras) {
        let _a; let _b;
        return _super.prototype.htmlToMarkdown.call(this, htmlString, {
            reportIDToName: (_a = extras === null || extras === void 0 ? void 0 : extras.reportIDToName) !== null && _a !== void 0 ? _a : reportIDToNameMap,
            accountIDToName: (_b = extras === null || extras === void 0 ? void 0 : extras.accountIDToName) !== null && _b !== void 0 ? _b : accountIDToNameMap,
            cacheVideoAttributes: extras === null || extras === void 0 ? void 0 : extras.cacheVideoAttributes,
        });
    };
    ExpensiMarkWithContext.prototype.htmlToText = function (htmlString, extras) {
        let _a; let _b;
        return _super.prototype.htmlToText.call(this, htmlString, {
            reportIDToName: (_a = extras === null || extras === void 0 ? void 0 : extras.reportIDToName) !== null && _a !== void 0 ? _a : reportIDToNameMap,
            accountIDToName: (_b = extras === null || extras === void 0 ? void 0 : extras.accountIDToName) !== null && _b !== void 0 ? _b : accountIDToNameMap,
            cacheVideoAttributes: extras === null || extras === void 0 ? void 0 : extras.cacheVideoAttributes,
        });
    };
    ExpensiMarkWithContext.prototype.truncateHTML = function (htmlString, limit, extras) {
        return _super.prototype.truncateHTML.call(this, htmlString, limit, extras);
    };
    return ExpensiMarkWithContext;
})(expensify_common_1.ExpensiMark);
ExpensiMarkWithContext.setLogger(Log_1['default']);
const Parser = new ExpensiMarkWithContext();
exports['default'] = Parser;
