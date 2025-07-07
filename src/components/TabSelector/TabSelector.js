"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FocusTrapContainerElement_1 = require("@components/FocusTrap/FocusTrapContainerElement");
var Expensicons = require("@components/Icon/Expensicons");
var useLocalize_1 = require("@hooks/useLocalize");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
var getBackground_1 = require("./getBackground");
var getOpacity_1 = require("./getOpacity");
var TabSelectorItem_1 = require("./TabSelectorItem");
function getIconTitleAndTestID(route, translate) {
    switch (route) {
        case CONST_1.default.TAB_REQUEST.MANUAL:
            return { icon: Expensicons.Pencil, title: translate('tabSelector.manual'), testID: 'manual' };
        case CONST_1.default.TAB_REQUEST.SCAN:
            return { icon: Expensicons.ReceiptScan, title: translate('tabSelector.scan'), testID: 'scan' };
        case CONST_1.default.TAB.NEW_CHAT:
            return { icon: Expensicons.User, title: translate('tabSelector.chat'), testID: 'chat' };
        case CONST_1.default.TAB.NEW_ROOM:
            return { icon: Expensicons.Hashtag, title: translate('tabSelector.room'), testID: 'room' };
        case CONST_1.default.TAB_REQUEST.DISTANCE:
            return { icon: Expensicons.Car, title: translate('common.distance'), testID: 'distance' };
        case CONST_1.default.TAB.SHARE.SHARE:
            return { icon: Expensicons.UploadAlt, title: translate('common.share'), testID: 'share' };
        case CONST_1.default.TAB.SHARE.SUBMIT:
            return { icon: Expensicons.Receipt, title: translate('common.submit'), testID: 'submit' };
        case CONST_1.default.TAB_REQUEST.PER_DIEM:
            return { icon: Expensicons.CalendarSolid, title: translate('common.perDiem'), testID: 'perDiem' };
        default:
            throw new Error("Route ".concat(route, " has no icon nor title set."));
    }
}
function TabSelector(_a) {
    var state = _a.state, navigation = _a.navigation, _b = _a.onTabPress, onTabPress = _b === void 0 ? function () { } : _b, position = _a.position, onFocusTrapContainerElementChanged = _a.onFocusTrapContainerElementChanged, _c = _a.shouldShowLabelWhenInactive, shouldShowLabelWhenInactive = _c === void 0 ? true : _c, _d = _a.shouldShowProductTrainingTooltip, shouldShowProductTrainingTooltip = _d === void 0 ? false : _d, renderProductTrainingTooltip = _a.renderProductTrainingTooltip;
    var translate = (0, useLocalize_1.default)().translate;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var defaultAffectedAnimatedTabs = (0, react_1.useMemo)(function () { return Array.from({ length: state.routes.length }, function (v, i) { return i; }); }, [state.routes.length]);
    var _e = (0, react_1.useState)(defaultAffectedAnimatedTabs), affectedAnimatedTabs = _e[0], setAffectedAnimatedTabs = _e[1];
    (0, react_1.useEffect)(function () {
        // It is required to wait transition end to reset affectedAnimatedTabs because tabs style is still animating during transition.
        setTimeout(function () {
            setAffectedAnimatedTabs(defaultAffectedAnimatedTabs);
        }, CONST_1.default.ANIMATED_TRANSITION);
    }, [defaultAffectedAnimatedTabs, state.index]);
    return (<FocusTrapContainerElement_1.default onContainerElementChanged={onFocusTrapContainerElementChanged}>
            <react_native_1.View style={styles.tabSelector}>
                {state.routes.map(function (route, index) {
            var isActive = index === state.index;
            var activeOpacity = (0, getOpacity_1.default)({ routesLength: state.routes.length, tabIndex: index, active: true, affectedTabs: affectedAnimatedTabs, position: position, isActive: isActive });
            var inactiveOpacity = (0, getOpacity_1.default)({ routesLength: state.routes.length, tabIndex: index, active: false, affectedTabs: affectedAnimatedTabs, position: position, isActive: isActive });
            var backgroundColor = (0, getBackground_1.default)({ routesLength: state.routes.length, tabIndex: index, affectedTabs: affectedAnimatedTabs, theme: theme, position: position, isActive: isActive });
            var _a = getIconTitleAndTestID(route.name, translate), icon = _a.icon, title = _a.title, testID = _a.testID;
            var onPress = function () {
                if (isActive) {
                    return;
                }
                setAffectedAnimatedTabs([state.index, index]);
                var event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                });
                if (!event.defaultPrevented) {
                    // The `merge: true` option makes sure that the params inside the tab screen are preserved
                    navigation.navigate(route.name, { key: route.key, merge: true });
                }
                onTabPress(route.name);
            };
            return (<TabSelectorItem_1.default key={route.name} icon={icon} title={title} onPress={onPress} activeOpacity={activeOpacity} inactiveOpacity={inactiveOpacity} backgroundColor={backgroundColor} isActive={isActive} testID={testID} shouldShowLabelWhenInactive={shouldShowLabelWhenInactive} shouldShowProductTrainingTooltip={shouldShowProductTrainingTooltip} renderProductTrainingTooltip={renderProductTrainingTooltip}/>);
        })}
            </react_native_1.View>
        </FocusTrapContainerElement_1.default>);
}
TabSelector.displayName = 'TabSelector';
exports.default = TabSelector;
