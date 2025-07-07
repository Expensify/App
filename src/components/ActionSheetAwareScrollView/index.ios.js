"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Actions = exports.ActionSheetAwareScrollViewProvider = exports.ActionSheetAwareScrollViewContext = void 0;
exports.renderScrollComponent = renderScrollComponent;
var react_1 = require("react");
var react_native_reanimated_1 = require("react-native-reanimated");
var ActionSheetAwareScrollViewContext_1 = require("./ActionSheetAwareScrollViewContext");
Object.defineProperty(exports, "Actions", { enumerable: true, get: function () { return ActionSheetAwareScrollViewContext_1.Actions; } });
Object.defineProperty(exports, "ActionSheetAwareScrollViewContext", { enumerable: true, get: function () { return ActionSheetAwareScrollViewContext_1.ActionSheetAwareScrollViewContext; } });
Object.defineProperty(exports, "ActionSheetAwareScrollViewProvider", { enumerable: true, get: function () { return ActionSheetAwareScrollViewContext_1.ActionSheetAwareScrollViewProvider; } });
var ActionSheetKeyboardSpace_1 = require("./ActionSheetKeyboardSpace");
var ActionSheetAwareScrollView = (0, react_1.forwardRef)(function (props, ref) {
    var scrollViewAnimatedRef = (0, react_native_reanimated_1.useAnimatedRef)();
    var position = (0, react_native_reanimated_1.useScrollViewOffset)(scrollViewAnimatedRef);
    var onRef = (0, react_1.useCallback)(function (assignedRef) {
        if (typeof ref === 'function') {
            ref(assignedRef);
        }
        else if (ref) {
            // eslint-disable-next-line no-param-reassign
            ref.current = assignedRef;
        }
        scrollViewAnimatedRef(assignedRef);
    }, [ref, scrollViewAnimatedRef]);
    return (<react_native_reanimated_1.default.ScrollView ref={onRef} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}>
            <ActionSheetKeyboardSpace_1.default position={position}>{props.children}</ActionSheetKeyboardSpace_1.default>
        </react_native_reanimated_1.default.ScrollView>);
});
exports.default = ActionSheetAwareScrollView;
/**
 * This function should be used as renderScrollComponent prop for FlatList
 * @param props - props that will be passed to the ScrollView from FlatList
 * @returns - ActionSheetAwareScrollView
 */
function renderScrollComponent(props) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <ActionSheetAwareScrollView {...props}/>;
}
