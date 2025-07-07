"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_error_boundary_1 = require("react-error-boundary");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var usePrevious_1 = require("@hooks/usePrevious");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var PendingMapView_1 = require("./PendingMapView");
var MapView = (0, react_1.forwardRef)(function (props, ref) {
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var _a = (0, react_1.useState)(0), errorResetKey = _a[0], setErrorResetKey = _a[1];
    // Retry the error when reconnecting.
    var wasOffline = (0, usePrevious_1.default)(isOffline);
    (0, react_1.useEffect)(function () {
        if (!wasOffline || isOffline) {
            return;
        }
        setErrorResetKey(function (key) { return key + 1; });
    }, [isOffline, wasOffline]);
    // The only way to retry loading the module is to call `React.lazy` again.
    var MapViewImpl = (0, react_1.useMemo)(function () { return (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('./MapViewImpl.website'); }); }); }, 
    // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    [errorResetKey]);
    return (<react_error_boundary_1.ErrorBoundary resetKeys={[errorResetKey]} fallback={<PendingMapView_1.default title={isOffline ? translate('distance.mapPending.title') : translate('distance.mapPending.errorTitle')} subtitle={isOffline ? translate('distance.mapPending.subtitle') : translate('distance.mapPending.errorSubtitle')} style={styles.mapEditView}/>}>
            <react_1.Suspense fallback={<FullscreenLoadingIndicator_1.default />}>
                <MapViewImpl ref={ref} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}/>
            </react_1.Suspense>
        </react_error_boundary_1.ErrorBoundary>);
});
exports.default = MapView;
