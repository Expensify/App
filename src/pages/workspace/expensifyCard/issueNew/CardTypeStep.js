"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Illustrations = require("@components/Icon/Illustrations");
var InteractiveStepWrapper_1 = require("@components/InteractiveStepWrapper");
var MenuItem_1 = require("@components/MenuItem");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Card_1 = require("@libs/actions/Card");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function CardTypeStep(_a) {
    var policyID = _a.policyID;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var issueNewCard = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.ISSUE_NEW_EXPENSIFY_CARD).concat(policyID))[0];
    var isEditing = issueNewCard === null || issueNewCard === void 0 ? void 0 : issueNewCard.isEditing;
    var submit = function (value) {
        (0, Card_1.setIssueNewCardStepAndData)({
            step: isEditing ? CONST_1.default.EXPENSIFY_CARD.STEP.CONFIRMATION : CONST_1.default.EXPENSIFY_CARD.STEP.LIMIT_TYPE,
            data: {
                cardType: value,
            },
            isEditing: false,
            policyID: policyID,
        });
    };
    var handleBackButtonPress = function () {
        if (isEditing) {
            (0, Card_1.setIssueNewCardStepAndData)({ step: CONST_1.default.EXPENSIFY_CARD.STEP.CONFIRMATION, isEditing: false, policyID: policyID });
            return;
        }
        (0, Card_1.setIssueNewCardStepAndData)({ step: CONST_1.default.EXPENSIFY_CARD.STEP.ASSIGNEE, policyID: policyID });
    };
    return (<InteractiveStepWrapper_1.default wrapperID={CardTypeStep.displayName} shouldEnablePickerAvoiding={false} shouldEnableMaxHeight offlineIndicatorStyle={styles.mtAuto} headerTitle={translate('workspace.card.issueCard')} handleBackButtonPress={handleBackButtonPress} startStepIndex={1} stepNames={CONST_1.default.EXPENSIFY_CARD.STEP_NAMES} enableEdgeToEdgeBottomSafeAreaPadding>
            <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.card.issueNewCard.chooseCardType')}</Text_1.default>
            <react_native_1.View style={styles.mh5}>
                <MenuItem_1.default icon={Illustrations.HandCard} title={translate('workspace.card.issueNewCard.physicalCard')} description={translate('workspace.card.issueNewCard.physicalCardDescription')} shouldShowRightIcon onPress={function () { return submit(CONST_1.default.EXPENSIFY_CARD.CARD_TYPE.PHYSICAL); }} displayInDefaultIconColor iconStyles={[styles.ml3, styles.mr2]} iconWidth={variables_1.default.menuIconSize} iconHeight={variables_1.default.menuIconSize} wrapperStyle={styles.purposeMenuItem}/>
                <MenuItem_1.default icon={Illustrations.VirtualCard} title={translate('workspace.card.issueNewCard.virtualCard')} description={translate('workspace.card.issueNewCard.virtualCardDescription')} shouldShowRightIcon onPress={function () { return submit(CONST_1.default.EXPENSIFY_CARD.CARD_TYPE.VIRTUAL); }} displayInDefaultIconColor iconStyles={[styles.ml3, styles.mr2]} iconWidth={variables_1.default.menuIconSize} iconHeight={variables_1.default.menuIconSize} wrapperStyle={styles.purposeMenuItem}/>
            </react_native_1.View>
        </InteractiveStepWrapper_1.default>);
}
CardTypeStep.displayName = 'CardTypeStep';
exports.default = CardTypeStep;
