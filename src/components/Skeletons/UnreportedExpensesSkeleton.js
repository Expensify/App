"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_svg_1 = require("react-native-svg");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ItemListSkeletonView_1 = require("./ItemListSkeletonView");
function getMessageSkeletonWidth(index) {
    switch (index % 3) {
        case 0:
            return 120;
        case 1:
            return 90;
        case 2:
            return 70;
        default:
            return 100;
    }
}
function getExpenseAmountSkeletonWidth(index) {
    switch (index % 3) {
        case 0:
            return 45;
        case 1:
            return 36;
        case 2:
            return 24;
        default:
            return 24;
    }
}
function UnreportedExpensesSkeleton(_a) {
    var fixedNumberOfItems = _a.fixedNumberOfItems;
    var containerRef = (0, react_1.useRef)(null);
    var styles = (0, useThemeStyles_1.default)();
    var _b = react_1.default.useState(0), pageWidth = _b[0], setPageWidth = _b[1];
    (0, react_1.useLayoutEffect)(function () {
        var _a;
        (_a = containerRef.current) === null || _a === void 0 ? void 0 : _a.measure(function (x, y, width) {
            setPageWidth(width - 24);
        });
    }, []);
    var skeletonItem = (0, react_1.useCallback)(function (args) {
        return (<>
                    <react_native_svg_1.Rect x={12} y={22} width={20} height={20} rx={4} ry={4}/>
                    <react_native_svg_1.Rect x={44} y={12} width={36} height={40} rx={4} ry={4}/>
                    <react_native_svg_1.Rect x={92} y={26} width={getMessageSkeletonWidth(args.itemIndex)} height={12}/>
                    <react_native_svg_1.Rect x={pageWidth - 12 - getExpenseAmountSkeletonWidth(args.itemIndex)} y={26} width={getExpenseAmountSkeletonWidth(args.itemIndex)} height={12}/>
                </>);
    }, [pageWidth]);
    return (<react_native_1.View style={[styles.flex1, styles.pt3]} ref={containerRef}>
            <ItemListSkeletonView_1.default itemViewHeight={64} itemViewStyle={[styles.highlightBG, styles.mb2, styles.br2, styles.ml3, styles.mr3]} shouldAnimate fixedNumItems={fixedNumberOfItems} renderSkeletonItem={skeletonItem}/>
        </react_native_1.View>);
}
UnreportedExpensesSkeleton.displayName = 'UnreportedExpensesSkeleton';
exports.default = UnreportedExpensesSkeleton;
