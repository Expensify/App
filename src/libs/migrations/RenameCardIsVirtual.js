"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
var react_native_onyx_1 = require("react-native-onyx");
var Log_1 = require("@libs/Log");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
// This migration changes the property name on each card from card list from isVirtual to nameValuePairs.isVirtual
function default_1() {
    return new Promise(function (resolve) {
        var connection = react_native_onyx_1.default.connect({
            key: ONYXKEYS_1.default.CARD_LIST,
            callback: function (cardList) {
                react_native_onyx_1.default.disconnect(connection);
                if (!cardList || (0, EmptyObject_1.isEmptyObject)(cardList)) {
                    Log_1.default.info('[Migrate Onyx] Skipped migration RenameCardIsVirtual because there are no cards linked to the account');
                    return resolve();
                }
                var cardsWithIsVirtualProp = Object.values(cardList).filter(function (card) { var _a; return ((_a = card === null || card === void 0 ? void 0 : card.nameValuePairs) === null || _a === void 0 ? void 0 : _a.isVirtual) !== undefined; });
                if (!cardsWithIsVirtualProp.length) {
                    Log_1.default.info('[Migrate Onyx] Skipped migration RenameCardIsVirtual because there were no cards with the isVirtual property');
                    return resolve();
                }
                Log_1.default.info('[Migrate Onyx] Running  RenameCardIsVirtual migration');
                var dataToSave = cardsWithIsVirtualProp.reduce(function (acc, card) {
                    var _a;
                    if (!card) {
                        return acc;
                    }
                    acc[card.cardID] = {
                        nameValuePairs: {
                            isVirtual: (_a = card === null || card === void 0 ? void 0 : card.nameValuePairs) === null || _a === void 0 ? void 0 : _a.isVirtual,
                        },
                        isVirtual: undefined,
                    };
                    return acc;
                }, {});
                // eslint-disable-next-line rulesdir/prefer-actions-set-data
                react_native_onyx_1.default.merge(ONYXKEYS_1.default.CARD_LIST, dataToSave).then(function () {
                    var _a;
                    Log_1.default.info("[Migrate Onyx] Ran migration RenameCardIsVirtual and renamed ".concat((_a = Object.keys(dataToSave)) === null || _a === void 0 ? void 0 : _a.length, " properties"));
                    resolve();
                });
            },
        });
    });
}
