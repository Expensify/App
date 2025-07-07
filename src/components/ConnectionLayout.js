"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var isEmpty_1 = require("lodash/isEmpty");
var react_1 = require("react");
var react_native_1 = require("react-native");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var HeaderWithBackButton_1 = require("./HeaderWithBackButton");
var ScreenWrapper_1 = require("./ScreenWrapper");
var ScrollView_1 = require("./ScrollView");
var Text_1 = require("./Text");
function ConnectionLayoutContent(_a) {
    var title = _a.title, titleStyle = _a.titleStyle, children = _a.children, titleAlreadyTranslated = _a.titleAlreadyTranslated;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    return (<>
            {!!title && <Text_1.default style={[styles.pb5, titleStyle]}>{titleAlreadyTranslated !== null && titleAlreadyTranslated !== void 0 ? titleAlreadyTranslated : translate(title)}</Text_1.default>}
            {children}
        </>);
}
function ConnectionLayout(_a) {
    var _b;
    var displayName = _a.displayName, headerTitle = _a.headerTitle, children = _a.children, title = _a.title, headerSubtitle = _a.headerSubtitle, policyID = _a.policyID, accessVariants = _a.accessVariants, featureName = _a.featureName, contentContainerStyle = _a.contentContainerStyle, titleStyle = _a.titleStyle, shouldIncludeSafeAreaPaddingBottom = _a.shouldIncludeSafeAreaPaddingBottom, connectionName = _a.connectionName, _c = _a.shouldUseScrollView, shouldUseScrollView = _c === void 0 ? true : _c, headerTitleAlreadyTranslated = _a.headerTitleAlreadyTranslated, titleAlreadyTranslated = _a.titleAlreadyTranslated, _d = _a.shouldLoadForEmptyConnection, shouldLoadForEmptyConnection = _d === void 0 ? false : _d, _e = _a.onBackButtonPress, onBackButtonPress = _e === void 0 ? function () { return Navigation_1.default.goBack(); } : _e, _f = _a.shouldBeBlocked, shouldBeBlocked = _f === void 0 ? false : _f;
    var translate = (0, useLocalize_1.default)().translate;
    var policy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID))[0];
    var isConnectionEmpty = (0, isEmpty_1.default)((_b = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _b === void 0 ? void 0 : _b[connectionName]);
    var renderSelectionContent = (0, react_1.useMemo)(function () { return (<ConnectionLayoutContent title={title} titleStyle={titleStyle} titleAlreadyTranslated={titleAlreadyTranslated}>
                {children}
            </ConnectionLayoutContent>); }, [title, titleStyle, children, titleAlreadyTranslated]);
    var shouldBlockByConnection = shouldLoadForEmptyConnection ? !isConnectionEmpty : isConnectionEmpty;
    return (<AccessOrNotFoundWrapper_1.default policyID={policyID} accessVariants={accessVariants} featureName={featureName} shouldBeBlocked={!!shouldBeBlocked || shouldBlockByConnection}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding includeSafeAreaPaddingBottom={!!shouldIncludeSafeAreaPaddingBottom} shouldEnableMaxHeight testID={displayName}>
                <HeaderWithBackButton_1.default title={headerTitleAlreadyTranslated !== null && headerTitleAlreadyTranslated !== void 0 ? headerTitleAlreadyTranslated : (headerTitle ? translate(headerTitle) : '')} subtitle={headerSubtitle} onBackButtonPress={onBackButtonPress}/>
                {shouldUseScrollView ? (<ScrollView_1.default contentContainerStyle={contentContainerStyle} addBottomSafeAreaPadding>
                        {renderSelectionContent}
                    </ScrollView_1.default>) : (<react_native_1.View style={contentContainerStyle}>{renderSelectionContent}</react_native_1.View>)}
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
ConnectionLayout.displayName = 'ConnectionLayout';
exports.default = ConnectionLayout;
