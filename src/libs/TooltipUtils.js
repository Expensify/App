"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isProductTrainingElementDismissed(elementName, dismissedProductTraining) {
    var _a;
    return typeof (dismissedProductTraining === null || dismissedProductTraining === void 0 ? void 0 : dismissedProductTraining[elementName]) === 'string' ? !!(dismissedProductTraining === null || dismissedProductTraining === void 0 ? void 0 : dismissedProductTraining[elementName]) : !!((_a = dismissedProductTraining === null || dismissedProductTraining === void 0 ? void 0 : dismissedProductTraining[elementName]) === null || _a === void 0 ? void 0 : _a.timestamp);
}
exports.default = isProductTrainingElementDismissed;
