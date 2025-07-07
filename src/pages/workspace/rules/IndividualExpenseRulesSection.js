"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var Section_1 = require("@components/Section");
var Switch_1 = require("@components/Switch");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var usePolicy_1 = require("@hooks/usePolicy");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Link_1 = require("@libs/actions/Link");
var Policy_1 = require("@libs/actions/Policy/Policy");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
function IndividualExpenseRulesSectionSubtitle(_a) {
    var policy = _a.policy, translate = _a.translate, styles = _a.styles;
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var handleOnPressCategoriesLink = function () {
        if (policy === null || policy === void 0 ? void 0 : policy.areCategoriesEnabled) {
            Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_CATEGORIES.getRoute(policyID));
            return;
        }
        Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_MORE_FEATURES.getRoute(policyID));
    };
    var handleOnPressTagsLink = function () {
        if (policy === null || policy === void 0 ? void 0 : policy.areTagsEnabled) {
            Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_TAGS.getRoute(policyID));
            return;
        }
        Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_MORE_FEATURES.getRoute(policyID));
    };
    return (<Text_1.default style={[styles.flexRow, styles.alignItemsCenter, styles.w100, styles.mt2]}>
            <Text_1.default style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.rules.individualExpenseRules.subtitle')}</Text_1.default>{' '}
            <TextLink_1.default style={styles.link} onPress={handleOnPressCategoriesLink}>
                {translate('workspace.common.categories').toLowerCase()}
            </TextLink_1.default>{' '}
            <Text_1.default style={[styles.textNormal, styles.colorMuted]}>{translate('common.and')}</Text_1.default>{' '}
            <TextLink_1.default style={styles.link} onPress={handleOnPressTagsLink}>
                {translate('workspace.common.tags').toLowerCase()}
            </TextLink_1.default>
            .
        </Text_1.default>);
}
function IndividualExpenseRulesSection(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    var policyID = _a.policyID;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var policy = (0, usePolicy_1.default)(policyID);
    var policyCurrency = (_b = policy === null || policy === void 0 ? void 0 : policy.outputCurrency) !== null && _b !== void 0 ? _b : CONST_1.default.CURRENCY.USD;
    var maxExpenseAmountNoReceiptText = (0, react_1.useMemo)(function () {
        if ((policy === null || policy === void 0 ? void 0 : policy.maxExpenseAmountNoReceipt) === CONST_1.default.DISABLED_MAX_EXPENSE_VALUE) {
            return '';
        }
        return (0, CurrencyUtils_1.convertToDisplayString)(policy === null || policy === void 0 ? void 0 : policy.maxExpenseAmountNoReceipt, policyCurrency);
    }, [policy === null || policy === void 0 ? void 0 : policy.maxExpenseAmountNoReceipt, policyCurrency]);
    var maxExpenseAmountText = (0, react_1.useMemo)(function () {
        if ((policy === null || policy === void 0 ? void 0 : policy.maxExpenseAmount) === CONST_1.default.DISABLED_MAX_EXPENSE_VALUE) {
            return '';
        }
        return (0, CurrencyUtils_1.convertToDisplayString)(policy === null || policy === void 0 ? void 0 : policy.maxExpenseAmount, policyCurrency);
    }, [policy === null || policy === void 0 ? void 0 : policy.maxExpenseAmount, policyCurrency]);
    var maxExpenseAgeText = (0, react_1.useMemo)(function () {
        var _a;
        if ((policy === null || policy === void 0 ? void 0 : policy.maxExpenseAge) === CONST_1.default.DISABLED_MAX_EXPENSE_VALUE) {
            return '';
        }
        return translate('workspace.rules.individualExpenseRules.maxExpenseAgeDays', { count: (_a = policy === null || policy === void 0 ? void 0 : policy.maxExpenseAge) !== null && _a !== void 0 ? _a : 0 });
    }, [policy === null || policy === void 0 ? void 0 : policy.maxExpenseAge, translate]);
    var billableModeText = translate("workspace.rules.individualExpenseRules.".concat((policy === null || policy === void 0 ? void 0 : policy.defaultBillable) ? 'billable' : 'nonBillable'));
    var prohibitedExpenses = (0, react_1.useMemo)(function () {
        var _a, _b, _c, _d, _e;
        // Otherwise return which expenses are prohibited comma separated
        var prohibitedExpensesList = [];
        if ((_a = policy === null || policy === void 0 ? void 0 : policy.prohibitedExpenses) === null || _a === void 0 ? void 0 : _a.adultEntertainment) {
            prohibitedExpensesList.push(translate('workspace.rules.individualExpenseRules.adultEntertainment'));
        }
        if ((_b = policy === null || policy === void 0 ? void 0 : policy.prohibitedExpenses) === null || _b === void 0 ? void 0 : _b.alcohol) {
            prohibitedExpensesList.push(translate('workspace.rules.individualExpenseRules.alcohol'));
        }
        if ((_c = policy === null || policy === void 0 ? void 0 : policy.prohibitedExpenses) === null || _c === void 0 ? void 0 : _c.gambling) {
            prohibitedExpensesList.push(translate('workspace.rules.individualExpenseRules.gambling'));
        }
        if ((_d = policy === null || policy === void 0 ? void 0 : policy.prohibitedExpenses) === null || _d === void 0 ? void 0 : _d.hotelIncidentals) {
            prohibitedExpensesList.push(translate('workspace.rules.individualExpenseRules.hotelIncidentals'));
        }
        if ((_e = policy === null || policy === void 0 ? void 0 : policy.prohibitedExpenses) === null || _e === void 0 ? void 0 : _e.tobacco) {
            prohibitedExpensesList.push(translate('workspace.rules.individualExpenseRules.tobacco'));
        }
        // If no expenses are prohibited, return empty string
        if (!prohibitedExpensesList.length) {
            return '';
        }
        return prohibitedExpensesList.join(', ');
    }, [policy === null || policy === void 0 ? void 0 : policy.prohibitedExpenses, translate]);
    var individualExpenseRulesItems = [
        {
            title: maxExpenseAmountNoReceiptText,
            descriptionTranslationKey: 'workspace.rules.individualExpenseRules.receiptRequiredAmount',
            action: function () { return Navigation_1.default.navigate(ROUTES_1.default.RULES_RECEIPT_REQUIRED_AMOUNT.getRoute(policyID)); },
            pendingAction: (_c = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _c === void 0 ? void 0 : _c.maxExpenseAmountNoReceipt,
        },
        {
            title: maxExpenseAmountText,
            descriptionTranslationKey: 'workspace.rules.individualExpenseRules.maxExpenseAmount',
            action: function () { return Navigation_1.default.navigate(ROUTES_1.default.RULES_MAX_EXPENSE_AMOUNT.getRoute(policyID)); },
            pendingAction: (_d = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _d === void 0 ? void 0 : _d.maxExpenseAmount,
        },
        {
            title: maxExpenseAgeText,
            descriptionTranslationKey: 'workspace.rules.individualExpenseRules.maxExpenseAge',
            action: function () { return Navigation_1.default.navigate(ROUTES_1.default.RULES_MAX_EXPENSE_AGE.getRoute(policyID)); },
            pendingAction: (_e = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _e === void 0 ? void 0 : _e.maxExpenseAge,
        },
        {
            title: billableModeText,
            descriptionTranslationKey: 'workspace.rules.individualExpenseRules.billableDefault',
            action: function () { return Navigation_1.default.navigate(ROUTES_1.default.RULES_BILLABLE_DEFAULT.getRoute(policyID)); },
            pendingAction: (_f = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _f === void 0 ? void 0 : _f.defaultBillable,
        },
    ];
    individualExpenseRulesItems.push({
        title: prohibitedExpenses,
        descriptionTranslationKey: 'workspace.rules.individualExpenseRules.prohibitedExpenses',
        action: function () { return Navigation_1.default.navigate(ROUTES_1.default.RULES_PROHIBITED_DEFAULT.getRoute(policyID)); },
        pendingAction: !(0, EmptyObject_1.isEmptyObject)((_g = policy === null || policy === void 0 ? void 0 : policy.prohibitedExpenses) === null || _g === void 0 ? void 0 : _g.pendingFields) ? CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE : undefined,
    });
    var areEReceiptsEnabled = (_h = policy === null || policy === void 0 ? void 0 : policy.eReceipts) !== null && _h !== void 0 ? _h : false;
    // For backwards compatibility with Expensify Classic, we assume that Attendee Tracking is enabled by default on
    // Control policies if the policy does not contain the attribute
    var isAttendeeTrackingEnabled = (_j = policy === null || policy === void 0 ? void 0 : policy.isAttendeeTrackingEnabled) !== null && _j !== void 0 ? _j : true;
    return (<Section_1.default isCentralPane title={translate('workspace.rules.individualExpenseRules.title')} renderSubtitle={function () { return (<IndividualExpenseRulesSectionSubtitle policy={policy} translate={translate} styles={styles}/>); }} subtitle={translate('workspace.rules.individualExpenseRules.subtitle')} titleStyles={styles.accountSettingsSectionTitle}>
            <react_native_1.View style={[styles.mt3, styles.gap3]}>
                {individualExpenseRulesItems.map(function (item) { return (<OfflineWithFeedback_1.default pendingAction={item.pendingAction} key={translate(item.descriptionTranslationKey)}>
                        <MenuItemWithTopDescription_1.default shouldShowRightIcon title={item.title} description={translate(item.descriptionTranslationKey)} onPress={item.action} wrapperStyle={[styles.sectionMenuItemTopDescription]} numberOfLinesTitle={2}/>
                    </OfflineWithFeedback_1.default>); })}

                <react_native_1.View style={[styles.mt3]}>
                    <OfflineWithFeedback_1.default pendingAction={(_k = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _k === void 0 ? void 0 : _k.eReceipts}>
                        <react_native_1.View style={[styles.flexRow, styles.mb1, styles.mr2, styles.alignItemsCenter, styles.justifyContentBetween]}>
                            <Text_1.default style={[styles.flexShrink1, styles.mr2]}>{translate('workspace.rules.individualExpenseRules.eReceipts')}</Text_1.default>
                            <Switch_1.default isOn={areEReceiptsEnabled} accessibilityLabel={translate('workspace.rules.individualExpenseRules.eReceipts')} onToggle={function () { return (0, Policy_1.setWorkspaceEReceiptsEnabled)(policyID, !areEReceiptsEnabled); }} disabled={policyCurrency !== CONST_1.default.CURRENCY.USD}/>
                        </react_native_1.View>
                    </OfflineWithFeedback_1.default>
                    <Text_1.default style={[styles.flexRow, styles.alignItemsCenter, styles.w100]}>
                        <Text_1.default style={[styles.textLabel, styles.colorMuted]}>{translate('workspace.rules.individualExpenseRules.eReceiptsHint')}</Text_1.default>{' '}
                        <TextLink_1.default style={[styles.textLabel, styles.link]} onPress={function () { return (0, Link_1.openExternalLink)(CONST_1.default.DEEP_DIVE_ERECEIPTS); }}>
                            {translate('workspace.rules.individualExpenseRules.eReceiptsHintLink')}
                        </TextLink_1.default>
                        .
                    </Text_1.default>
                </react_native_1.View>
                <react_native_1.View style={[styles.mt3]}>
                    <OfflineWithFeedback_1.default pendingAction={(_l = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _l === void 0 ? void 0 : _l.isAttendeeTrackingEnabled}>
                        <react_native_1.View style={[styles.flexRow, styles.mb1, styles.mr2, styles.alignItemsCenter, styles.justifyContentBetween]}>
                            <Text_1.default style={[styles.flexShrink1, styles.mr2]}>{translate('workspace.rules.individualExpenseRules.attendeeTracking')}</Text_1.default>
                            <Switch_1.default isOn={isAttendeeTrackingEnabled} accessibilityLabel={translate('workspace.rules.individualExpenseRules.attendeeTracking')} onToggle={function () { return (0, Policy_1.setPolicyAttendeeTrackingEnabled)(policyID, !isAttendeeTrackingEnabled); }}/>
                        </react_native_1.View>
                    </OfflineWithFeedback_1.default>
                    <Text_1.default style={[styles.flexRow, styles.alignItemsCenter, styles.w100]}>
                        <Text_1.default style={[styles.textLabel, styles.colorMuted]}>{translate('workspace.rules.individualExpenseRules.attendeeTrackingHint')}</Text_1.default>
                    </Text_1.default>
                </react_native_1.View>
            </react_native_1.View>
        </Section_1.default>);
}
exports.default = IndividualExpenseRulesSection;
