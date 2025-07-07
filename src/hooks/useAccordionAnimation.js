"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_reanimated_1 = require("react-native-reanimated");
/**
 * @returns two values: isExpanded, which manages the expansion of the accordion component,
 * and shouldAnimateAccordionSection, which determines whether we should animate
 * the expanding and collapsing of the accordion based on changes in isExpanded.
 */
function useAccordionAnimation(isExpanded) {
    var isAccordionExpanded = (0, react_native_reanimated_1.useSharedValue)(isExpanded);
    var shouldAnimateAccordionSection = (0, react_native_reanimated_1.useSharedValue)(false);
    var hasMounted = (0, react_native_reanimated_1.useSharedValue)(false);
    (0, react_1.useEffect)(function () {
        isAccordionExpanded.set(isExpanded);
        if (hasMounted.get()) {
            shouldAnimateAccordionSection.set(true);
        }
        else {
            hasMounted.set(true);
        }
    }, [hasMounted, isAccordionExpanded, isExpanded, shouldAnimateAccordionSection]);
    return { isAccordionExpanded: isAccordionExpanded, shouldAnimateAccordionSection: shouldAnimateAccordionSection };
}
exports.default = useAccordionAnimation;
