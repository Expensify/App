"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var Pressable_1 = require("@components/Pressable");
var Tooltip_1 = require("@components/Tooltip");
var useLocalize_1 = require("@hooks/useLocalize");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Performance_1 = require("@libs/Performance");
var Session_1 = require("@userActions/Session");
var Timing_1 = require("@userActions/Timing");
var CONST_1 = require("@src/CONST");
var SearchRouterContext_1 = require("./SearchRouterContext");
function SearchButton(_a) {
    var style = _a.style, _b = _a.shouldUseAutoHitSlop, shouldUseAutoHitSlop = _b === void 0 ? false : _b;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var openSearchRouter = (0, SearchRouterContext_1.useSearchRouterContext)().openSearchRouter;
    var pressableRef = (0, react_1.useRef)(null);
    return (<Tooltip_1.default text={translate('common.search')}>
            <Pressable_1.PressableWithoutFeedback ref={pressableRef} testID="searchButton" accessibilityLabel={translate('common.search')} style={[styles.flexRow, styles.touchableButtonImage, style]} shouldUseAutoHitSlop={shouldUseAutoHitSlop} 
    // eslint-disable-next-line react-compiler/react-compiler
    onPress={(0, Session_1.callFunctionIfActionIsAllowed)(function () {
            var _a;
            (_a = pressableRef === null || pressableRef === void 0 ? void 0 : pressableRef.current) === null || _a === void 0 ? void 0 : _a.blur();
            Timing_1.default.start(CONST_1.default.TIMING.OPEN_SEARCH);
            Performance_1.default.markStart(CONST_1.default.TIMING.OPEN_SEARCH);
            openSearchRouter();
        })}>
                <Icon_1.default src={Expensicons.MagnifyingGlass} fill={theme.icon}/>
            </Pressable_1.PressableWithoutFeedback>
        </Tooltip_1.default>);
}
SearchButton.displayName = 'SearchButton';
exports.default = SearchButton;
