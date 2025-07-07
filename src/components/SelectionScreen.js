"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var isEmpty_1 = require("lodash/isEmpty");
var react_1 = require("react");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var ErrorMessageRow_1 = require("./ErrorMessageRow");
var HeaderWithBackButton_1 = require("./HeaderWithBackButton");
var OfflineWithFeedback_1 = require("./OfflineWithFeedback");
var ScreenWrapper_1 = require("./ScreenWrapper");
var SelectionList_1 = require("./SelectionList");
function SelectionScreen(_a) {
    var _b;
    var displayName = _a.displayName, title = _a.title, headerContent = _a.headerContent, listEmptyContent = _a.listEmptyContent, listFooterContent = _a.listFooterContent, sections = _a.sections, listItem = _a.listItem, listItemWrapperStyle = _a.listItemWrapperStyle, initiallyFocusedOptionKey = _a.initiallyFocusedOptionKey, onSelectRow = _a.onSelectRow, onBackButtonPress = _a.onBackButtonPress, policyID = _a.policyID, accessVariants = _a.accessVariants, featureName = _a.featureName, shouldBeBlocked = _a.shouldBeBlocked, connectionName = _a.connectionName, pendingAction = _a.pendingAction, errors = _a.errors, errorRowStyles = _a.errorRowStyles, onClose = _a.onClose, shouldSingleExecuteRowSelect = _a.shouldSingleExecuteRowSelect, headerTitleAlreadyTranslated = _a.headerTitleAlreadyTranslated, textInputLabel = _a.textInputLabel, textInputValue = _a.textInputValue, onChangeText = _a.onChangeText, shouldShowTextInput = _a.shouldShowTextInput, _c = _a.shouldUpdateFocusedIndex, shouldUpdateFocusedIndex = _c === void 0 ? false : _c;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var policy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID))[0];
    var isConnectionEmpty = (0, isEmpty_1.default)((_b = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _b === void 0 ? void 0 : _b[connectionName]);
    return (<AccessOrNotFoundWrapper_1.default policyID={policyID} accessVariants={accessVariants} featureName={featureName} shouldBeBlocked={isConnectionEmpty || shouldBeBlocked}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding testID={displayName}>
                <HeaderWithBackButton_1.default title={headerTitleAlreadyTranslated !== null && headerTitleAlreadyTranslated !== void 0 ? headerTitleAlreadyTranslated : (title ? translate(title) : '')} onBackButtonPress={onBackButtonPress}/>
                {headerContent}
                <OfflineWithFeedback_1.default pendingAction={pendingAction} style={[styles.flex1]} contentContainerStyle={[styles.flex1]} shouldDisableOpacity={!sections.length}>
                    <SelectionList_1.default onSelectRow={onSelectRow} sections={sections} ListItem={listItem} showScrollIndicator onChangeText={onChangeText} shouldShowTooltips={false} initiallyFocusedOptionKey={initiallyFocusedOptionKey} listEmptyContent={listEmptyContent} textInputLabel={textInputLabel} textInputValue={textInputValue} shouldShowTextInput={shouldShowTextInput} listFooterContent={listFooterContent} sectionListStyle={!!sections.length && [styles.flexGrow0]} shouldSingleExecuteRowSelect={shouldSingleExecuteRowSelect} shouldUpdateFocusedIndex={shouldUpdateFocusedIndex} isAlternateTextMultilineSupported listItemWrapperStyle={listItemWrapperStyle} addBottomSafeAreaPadding={!errors || (0, EmptyObject_1.isEmptyObject)(errors)}>
                        <ErrorMessageRow_1.default errors={errors} errorRowStyles={errorRowStyles} onClose={onClose}/>
                    </SelectionList_1.default>
                </OfflineWithFeedback_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
SelectionScreen.displayName = 'SelectionScreen';
exports.default = SelectionScreen;
