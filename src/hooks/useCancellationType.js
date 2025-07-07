"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var useOnyx_1 = require("./useOnyx");
function useCancellationType() {
    var cancellationDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_PRIVATE_CANCELLATION_DETAILS)[0];
    var _a = (0, react_1.useState)(), cancellationType = _a[0], setCancellationType = _a[1];
    // Store initial cancellation details array in a ref for comparison
    var previousCancellationDetails = (0, react_1.useRef)(cancellationDetails);
    var memoizedCancellationType = (0, react_1.useMemo)(function () {
        var _a;
        var pendingManualCancellation = cancellationDetails === null || cancellationDetails === void 0 ? void 0 : cancellationDetails.filter(function (detail) { return detail.cancellationType === CONST_1.default.CANCELLATION_TYPE.MANUAL; }).find(function (detail) { return !detail.cancellationDate; });
        // There is a pending manual cancellation - return manual cancellation type
        if (pendingManualCancellation) {
            return CONST_1.default.CANCELLATION_TYPE.MANUAL;
        }
        // There are no new items in the cancellation details NVP
        // eslint-disable-next-line react-compiler/react-compiler
        if (((_a = previousCancellationDetails.current) === null || _a === void 0 ? void 0 : _a.length) === (cancellationDetails === null || cancellationDetails === void 0 ? void 0 : cancellationDetails.length)) {
            return;
        }
        // There is a new item in the cancellation details NVP, it has to be an automatic cancellation, as pending manual cancellations are handled above
        return CONST_1.default.CANCELLATION_TYPE.AUTOMATIC;
    }, [cancellationDetails]);
    (0, react_1.useEffect)(function () {
        if (!memoizedCancellationType) {
            return;
        }
        setCancellationType(memoizedCancellationType);
    }, [memoizedCancellationType]);
    return cancellationType;
}
exports.default = useCancellationType;
