"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var date_fns_1 = require("date-fns");
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var InteractiveStepWrapper_1 = require("@components/InteractiveStepWrapper");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PersonalDetailsUtils_1 = require("@libs/PersonalDetailsUtils");
var CompanyCards_1 = require("@userActions/CompanyCards");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function TransactionStartDateStep(_a) {
    var _b, _c, _d, _e, _f, _g;
    var policyID = _a.policyID, feed = _a.feed, backTo = _a.backTo;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var assignCard = (0, useOnyx_1.default)(ONYXKEYS_1.default.ASSIGN_CARD)[0];
    var isEditing = assignCard === null || assignCard === void 0 ? void 0 : assignCard.isEditing;
    var data = assignCard === null || assignCard === void 0 ? void 0 : assignCard.data;
    var assigneeDisplayName = (_d = (_c = (0, PersonalDetailsUtils_1.getPersonalDetailByEmail)((_b = data === null || data === void 0 ? void 0 : data.email) !== null && _b !== void 0 ? _b : '')) === null || _c === void 0 ? void 0 : _c.displayName) !== null && _d !== void 0 ? _d : '';
    var _h = (0, react_1.useState)((_e = data === null || data === void 0 ? void 0 : data.dateOption) !== null && _e !== void 0 ? _e : CONST_1.default.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.FROM_BEGINNING), dateOptionSelected = _h[0], setDateOptionSelected = _h[1];
    var startDate = (_g = (_f = assignCard === null || assignCard === void 0 ? void 0 : assignCard.startDate) !== null && _f !== void 0 ? _f : data === null || data === void 0 ? void 0 : data.startDate) !== null && _g !== void 0 ? _g : (0, date_fns_1.format)(new Date(), CONST_1.default.DATE.FNS_FORMAT_STRING);
    var handleBackButtonPress = function () {
        if (isEditing) {
            (0, CompanyCards_1.setAssignCardStepAndData)({
                currentStep: CONST_1.default.COMPANY_CARD.STEP.CONFIRMATION,
                isEditing: false,
            });
            return;
        }
        (0, CompanyCards_1.setAssignCardStepAndData)({ currentStep: CONST_1.default.COMPANY_CARD.STEP.CARD });
    };
    var handleSelectDateOption = function (dateOption) {
        setDateOptionSelected(dateOption);
    };
    var submit = function () {
        var date90DaysBack = (0, date_fns_1.format)((0, date_fns_1.subDays)(new Date(), 90), CONST_1.default.DATE.FNS_FORMAT_STRING);
        (0, CompanyCards_1.setAssignCardStepAndData)({
            currentStep: CONST_1.default.COMPANY_CARD.STEP.CONFIRMATION,
            data: {
                dateOption: dateOptionSelected,
                startDate: dateOptionSelected === CONST_1.default.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.FROM_BEGINNING ? date90DaysBack : startDate,
            },
            isEditing: false,
        });
    };
    var dateOptions = (0, react_1.useMemo)(function () { return [
        {
            value: CONST_1.default.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.FROM_BEGINNING,
            text: translate('workspace.companyCards.fromTheBeginning'),
            keyForList: CONST_1.default.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.FROM_BEGINNING,
            isSelected: dateOptionSelected === CONST_1.default.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.FROM_BEGINNING,
        },
        {
            value: CONST_1.default.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.CUSTOM,
            text: translate('workspace.companyCards.customStartDate'),
            keyForList: CONST_1.default.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.CUSTOM,
            isSelected: dateOptionSelected === CONST_1.default.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.CUSTOM,
        },
    ]; }, [dateOptionSelected, translate]);
    return (<InteractiveStepWrapper_1.default wrapperID={TransactionStartDateStep.displayName} handleBackButtonPress={handleBackButtonPress} startStepIndex={2} stepNames={CONST_1.default.COMPANY_CARD.STEP_NAMES} headerTitle={translate('workspace.companyCards.assignCard')} headerSubtitle={assigneeDisplayName} enableEdgeToEdgeBottomSafeAreaPadding>
            <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mt3]}>{translate('workspace.companyCards.chooseTransactionStartDate')}</Text_1.default>
            <Text_1.default style={[styles.textSupporting, styles.ph5, styles.mv3]}>{translate('workspace.companyCards.startDateDescription')}</Text_1.default>
            <react_native_1.View style={styles.flex1}>
                <SelectionList_1.default ListItem={RadioListItem_1.default} onSelectRow={function (_a) {
        var value = _a.value;
        return handleSelectDateOption(value);
    }} sections={[{ data: dateOptions }]} shouldSingleExecuteRowSelect initiallyFocusedOptionKey={dateOptionSelected} shouldUpdateFocusedIndex addBottomSafeAreaPadding footerContent={<Button_1.default success large pressOnEnter text={translate(isEditing ? 'common.confirm' : 'common.next')} onPress={submit}/>} listFooterContent={dateOptionSelected === CONST_1.default.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.CUSTOM ? (<MenuItemWithTopDescription_1.default description={translate('common.date')} title={startDate} shouldShowRightIcon onPress={function () {
                if (!policyID) {
                    return;
                }
                Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_COMPANY_CARDS_TRANSACTION_START_DATE.getRoute(policyID, feed, backTo));
            }}/>) : null}/>
            </react_native_1.View>
        </InteractiveStepWrapper_1.default>);
}
TransactionStartDateStep.displayName = 'TransactionStartDateStep';
exports.default = TransactionStartDateStep;
