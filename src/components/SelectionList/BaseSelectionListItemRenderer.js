"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Browser_1 = require("@libs/Browser");
var SearchUIUtils_1 = require("@libs/SearchUIUtils");
function BaseSelectionListItemRenderer(_a) {
    var _b;
    var ListItem = _a.ListItem, item = _a.item, index = _a.index, isFocused = _a.isFocused, isDisabled = _a.isDisabled, showTooltip = _a.showTooltip, canSelectMultiple = _a.canSelectMultiple, onLongPressRow = _a.onLongPressRow, shouldSingleExecuteRowSelect = _a.shouldSingleExecuteRowSelect, selectRow = _a.selectRow, onCheckboxPress = _a.onCheckboxPress, onDismissError = _a.onDismissError, shouldPreventDefaultFocusOnSelectRow = _a.shouldPreventDefaultFocusOnSelectRow, rightHandSideComponent = _a.rightHandSideComponent, isMultilineSupported = _a.isMultilineSupported, isAlternateTextMultilineSupported = _a.isAlternateTextMultilineSupported, alternateTextNumberOfLines = _a.alternateTextNumberOfLines, shouldIgnoreFocus = _a.shouldIgnoreFocus, setFocusedIndex = _a.setFocusedIndex, normalizedIndex = _a.normalizedIndex, shouldSyncFocus = _a.shouldSyncFocus, wrapperStyle = _a.wrapperStyle, titleStyles = _a.titleStyles, singleExecution = _a.singleExecution, titleContainerStyles = _a.titleContainerStyles, shouldUseDefaultRightHandSideCheckmark = _a.shouldUseDefaultRightHandSideCheckmark;
    var handleOnCheckboxPress = function () {
        if ((0, SearchUIUtils_1.isTransactionGroupListItemType)(item)) {
            return onCheckboxPress;
        }
        return onCheckboxPress ? function () { return onCheckboxPress(item); } : undefined;
    };
    return (<>
            <ListItem item={item} isFocused={isFocused} isDisabled={isDisabled} showTooltip={showTooltip} canSelectMultiple={canSelectMultiple} onLongPressRow={onLongPressRow} onSelectRow={function () {
            if (shouldSingleExecuteRowSelect) {
                singleExecution(function () { return selectRow(item, index); })();
            }
            else {
                selectRow(item, index);
            }
        }} onCheckboxPress={handleOnCheckboxPress()} onDismissError={function () { return onDismissError === null || onDismissError === void 0 ? void 0 : onDismissError(item); }} shouldPreventDefaultFocusOnSelectRow={shouldPreventDefaultFocusOnSelectRow} 
    // We're already handling the Enter key press in the useKeyboardShortcut hook, so we don't want the list item to submit the form
    shouldPreventEnterKeySubmit rightHandSideComponent={rightHandSideComponent} keyForList={(_b = item.keyForList) !== null && _b !== void 0 ? _b : ''} isMultilineSupported={isMultilineSupported} isAlternateTextMultilineSupported={isAlternateTextMultilineSupported} alternateTextNumberOfLines={alternateTextNumberOfLines} onFocus={function (event) {
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            if (shouldIgnoreFocus || isDisabled) {
                return;
            }
            // Prevent unexpected scrolling on mobile Chrome after the context menu closes by ignoring programmatic focus not triggered by direct user interaction.
            if ((0, Browser_1.isMobileChrome)() && event.nativeEvent && !event.nativeEvent.sourceCapabilities) {
                return;
            }
            setFocusedIndex(normalizedIndex);
        }} shouldSyncFocus={shouldSyncFocus} wrapperStyle={wrapperStyle} titleStyles={titleStyles} titleContainerStyles={titleContainerStyles} shouldUseDefaultRightHandSideCheckmark={shouldUseDefaultRightHandSideCheckmark}/>
            {item.footerContent && item.footerContent}
        </>);
}
BaseSelectionListItemRenderer.displayName = 'BaseSelectionListItemRenderer';
exports.default = BaseSelectionListItemRenderer;
