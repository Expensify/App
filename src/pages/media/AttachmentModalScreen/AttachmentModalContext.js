"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttachmentModalContextProvider = AttachmentModalContextProvider;
var react_1 = require("react");
var useCurrentReportID_1 = require("@hooks/useCurrentReportID");
var AttachmentModalContext = react_1.default.createContext({
    isAttachmentHidden: function () { return false; },
    updateHiddenAttachments: function () { },
    setCurrentAttachment: function () { },
    getCurrentAttachment: function () { return undefined; },
});
function AttachmentModalContextProvider(_a) {
    var children = _a.children;
    var currentReportID = (0, useCurrentReportID_1.default)();
    var hiddenAttachments = (0, react_1.useRef)({});
    (0, react_1.useEffect)(function () {
        // We only want to store the attachment visibility for the current report.
        // If the current report ID changes, clear the ref.
        hiddenAttachments.current = {};
    }, [currentReportID === null || currentReportID === void 0 ? void 0 : currentReportID.currentReportID]);
    var currentAttachment = (0, react_1.useRef)(undefined);
    var setCurrentAttachment = (0, react_1.useCallback)(function (attachmentProps) {
        currentAttachment.current = attachmentProps;
    }, []);
    var getCurrentAttachment = (0, react_1.useCallback)(function () { return currentAttachment.current; }, []);
    var contextValue = (0, react_1.useMemo)(function () { return ({
        isAttachmentHidden: function (reportActionID) { return hiddenAttachments.current[reportActionID]; },
        updateHiddenAttachments: function (reportActionID, value) {
            var _a;
            hiddenAttachments.current = __assign(__assign({}, hiddenAttachments.current), (_a = {}, _a[reportActionID] = value, _a));
        },
        setCurrentAttachment: setCurrentAttachment,
        getCurrentAttachment: getCurrentAttachment,
    }); }, [setCurrentAttachment, getCurrentAttachment]);
    return <AttachmentModalContext.Provider value={contextValue}>{children}</AttachmentModalContext.Provider>;
}
AttachmentModalContextProvider.displayName = 'AttachmentModalContextProvider';
exports.default = AttachmentModalContext;
