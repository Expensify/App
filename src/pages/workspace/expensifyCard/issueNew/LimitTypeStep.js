"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Button_1 = require("@components/Button");
var InteractiveStepWrapper_1 = require("@components/InteractiveStepWrapper");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Card_1 = require("@libs/actions/Card");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function LimitTypeStep(_a) {
    var _b, _c;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var issueNewCard = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.ISSUE_NEW_EXPENSIFY_CARD).concat(policyID))[0];
    var areApprovalsConfigured = (0, PolicyUtils_1.getApprovalWorkflow)(policy) !== CONST_1.default.POLICY.APPROVAL_MODE.OPTIONAL;
    var defaultType = areApprovalsConfigured ? CONST_1.default.EXPENSIFY_CARD.LIMIT_TYPES.SMART : CONST_1.default.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY;
    var _d = (0, react_1.useState)((_c = (_b = issueNewCard === null || issueNewCard === void 0 ? void 0 : issueNewCard.data) === null || _b === void 0 ? void 0 : _b.limitType) !== null && _c !== void 0 ? _c : defaultType), typeSelected = _d[0], setTypeSelected = _d[1];
    var isEditing = issueNewCard === null || issueNewCard === void 0 ? void 0 : issueNewCard.isEditing;
    var submit = (0, react_1.useCallback)(function () {
        (0, Card_1.setIssueNewCardStepAndData)({
            step: isEditing ? CONST_1.default.EXPENSIFY_CARD.STEP.CONFIRMATION : CONST_1.default.EXPENSIFY_CARD.STEP.LIMIT,
            data: { limitType: typeSelected },
            isEditing: false,
            policyID: policyID,
        });
    }, [isEditing, typeSelected, policyID]);
    var handleBackButtonPress = (0, react_1.useCallback)(function () {
        if (isEditing) {
            (0, Card_1.setIssueNewCardStepAndData)({ step: CONST_1.default.EXPENSIFY_CARD.STEP.CONFIRMATION, isEditing: false, policyID: policyID });
            return;
        }
        (0, Card_1.setIssueNewCardStepAndData)({ step: CONST_1.default.EXPENSIFY_CARD.STEP.CARD_TYPE, policyID: policyID });
    }, [isEditing, policyID]);
    var data = (0, react_1.useMemo)(function () {
        var options = [];
        if (areApprovalsConfigured) {
            options.push({
                value: CONST_1.default.EXPENSIFY_CARD.LIMIT_TYPES.SMART,
                text: translate('workspace.card.issueNewCard.smartLimit'),
                alternateText: translate('workspace.card.issueNewCard.smartLimitDescription'),
                keyForList: CONST_1.default.EXPENSIFY_CARD.LIMIT_TYPES.SMART,
                isSelected: typeSelected === CONST_1.default.EXPENSIFY_CARD.LIMIT_TYPES.SMART,
            });
        }
        options.push({
            value: CONST_1.default.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY,
            text: translate('workspace.card.issueNewCard.monthly'),
            alternateText: translate('workspace.card.issueNewCard.monthlyDescription'),
            keyForList: CONST_1.default.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY,
            isSelected: typeSelected === CONST_1.default.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY,
        }, {
            value: CONST_1.default.EXPENSIFY_CARD.LIMIT_TYPES.FIXED,
            text: translate('workspace.card.issueNewCard.fixedAmount'),
            alternateText: translate('workspace.card.issueNewCard.fixedAmountDescription'),
            keyForList: CONST_1.default.EXPENSIFY_CARD.LIMIT_TYPES.FIXED,
            isSelected: typeSelected === CONST_1.default.EXPENSIFY_CARD.LIMIT_TYPES.FIXED,
        });
        return options;
    }, [areApprovalsConfigured, translate, typeSelected]);
    return (<InteractiveStepWrapper_1.default wrapperID={LimitTypeStep.displayName} shouldEnablePickerAvoiding={false} shouldEnableMaxHeight headerTitle={translate('workspace.card.issueCard')} handleBackButtonPress={handleBackButtonPress} startStepIndex={2} stepNames={CONST_1.default.EXPENSIFY_CARD.STEP_NAMES} enableEdgeToEdgeBottomSafeAreaPadding>
            <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.card.issueNewCard.chooseLimitType')}</Text_1.default>
            <SelectionList_1.default ListItem={RadioListItem_1.default} onSelectRow={function (_a) {
        var value = _a.value;
        return setTypeSelected(value);
    }} sections={[{ data: data }]} shouldSingleExecuteRowSelect initiallyFocusedOptionKey={typeSelected} shouldUpdateFocusedIndex isAlternateTextMultilineSupported addBottomSafeAreaPadding footerContent={<Button_1.default success large pressOnEnter text={translate(isEditing ? 'common.confirm' : 'common.next')} onPress={submit}/>}/>
        </InteractiveStepWrapper_1.default>);
}
LimitTypeStep.displayName = 'LimitTypeStep';
exports.default = LimitTypeStep;
