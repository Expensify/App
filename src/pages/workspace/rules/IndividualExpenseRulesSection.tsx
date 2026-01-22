import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import RenderHTML from '@components/RenderHTML';
import Section from '@components/Section';
import useCardFeeds from '@hooks/useCardFeeds';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {setPolicyCategoryAttendeesRequired} from '@libs/actions/Policy/Category';
import {getCashExpenseReimbursableMode, setPolicyAttendeeTrackingEnabled, setPolicyRequireCompanyCardsEnabled, setWorkspaceEReceiptsEnabled} from '@libs/actions/Policy/Policy';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import type {ThemeStyles} from '@styles/index';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type IndividualExpenseRulesSectionProps = {
    policyID: string;
};

type IndividualExpenseRulesSectionSubtitleProps = {
    policy?: Policy;
    translate: LocaleContextProps['translate'];
    styles: ThemeStyles;
    environmentURL: string;
};

type IndividualExpenseRulesMenuItem = {
    title: string;
    descriptionTranslationKey: TranslationPaths;
    action: () => void;
    pendingAction?: PendingAction;
};

function IndividualExpenseRulesSectionSubtitle({policy, translate, styles, environmentURL}: IndividualExpenseRulesSectionSubtitleProps) {
    const policyID = policy?.id;

    const categoriesPageLink = useMemo(() => {
        if (policy?.areCategoriesEnabled) {
            return `${environmentURL}/${ROUTES.WORKSPACE_CATEGORIES.getRoute(policyID)}`;
        }

        return `${environmentURL}/${ROUTES.WORKSPACE_MORE_FEATURES.getRoute(policyID)}`;
    }, [policy?.areCategoriesEnabled, policyID, environmentURL]);

    const tagsPageLink = useMemo(() => {
        if (policy?.areTagsEnabled) {
            return `${environmentURL}/${ROUTES.WORKSPACE_TAGS.getRoute(policyID)}`;
        }

        return `${environmentURL}/${ROUTES.WORKSPACE_MORE_FEATURES.getRoute(policyID)}`;
    }, [policy?.areTagsEnabled, policyID, environmentURL]);

    return (
        <View style={[styles.flexRow, styles.renderHTML, styles.w100, styles.mt2]}>
            <RenderHTML html={translate('workspace.rules.individualExpenseRules.subtitle', categoriesPageLink, tagsPageLink)} />
        </View>
    );
}

function IndividualExpenseRulesSection({policyID}: IndividualExpenseRulesSectionProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policy = usePolicy(policyID);
    const [cardFeeds] = useCardFeeds(policyID);
    const {environmentURL} = useEnvironment();
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`, {canBeMissing: true});

    const policyCurrency = policy?.outputCurrency ?? CONST.CURRENCY.USD;

    const handleAttendeeTrackingToggle = useCallback(
        (newValue: boolean) => {
            // When disabling attendee tracking, disable areAttendeesRequired on all categories
            // that have it enabled in order to avoid BE validation errors
            if (!newValue && policyCategories) {
                for (const [categoryName, category] of Object.entries(policyCategories)) {
                    if (!category?.areAttendeesRequired) {
                        continue;
                    }
                    setPolicyCategoryAttendeesRequired(policyID, categoryName, false, policyCategories);
                }
            }
            setPolicyAttendeeTrackingEnabled(policyID, newValue);
        },
        [policyID, policyCategories],
    );

    const maxExpenseAmountNoReceiptText = useMemo(() => {
        if (policy?.maxExpenseAmountNoReceipt === CONST.DISABLED_MAX_EXPENSE_VALUE) {
            return '';
        }

        return convertToDisplayString(policy?.maxExpenseAmountNoReceipt, policyCurrency);
    }, [policy?.maxExpenseAmountNoReceipt, policyCurrency]);

    const maxExpenseAmountText = useMemo(() => {
        if (policy?.maxExpenseAmount === CONST.DISABLED_MAX_EXPENSE_VALUE) {
            return '';
        }

        return convertToDisplayString(policy?.maxExpenseAmount, policyCurrency);
    }, [policy?.maxExpenseAmount, policyCurrency]);

    const maxExpenseAgeText = useMemo(() => {
        if (policy?.maxExpenseAge === CONST.DISABLED_MAX_EXPENSE_VALUE) {
            return '';
        }

        return translate('workspace.rules.individualExpenseRules.maxExpenseAgeDays', {count: policy?.maxExpenseAge ?? 0});
    }, [policy?.maxExpenseAge, translate]);

    const reimbursableMode = getCashExpenseReimbursableMode(policy) ?? CONST.POLICY.CASH_EXPENSE_REIMBURSEMENT_CHOICES.REIMBURSABLE_DEFAULT;
    const reimbursableModeText = translate(`workspace.rules.individualExpenseRules.${reimbursableMode}`);
    const billableModeText = translate(`workspace.rules.individualExpenseRules.${policy?.defaultBillable ? 'billable' : 'nonBillable'}`);

    const prohibitedExpenses = useMemo(() => {
        // Otherwise return which expenses are prohibited comma separated
        const prohibitedExpensesList = [];
        if (policy?.prohibitedExpenses?.adultEntertainment) {
            prohibitedExpensesList.push(translate('workspace.rules.individualExpenseRules.adultEntertainment'));
        }

        if (policy?.prohibitedExpenses?.alcohol) {
            prohibitedExpensesList.push(translate('workspace.rules.individualExpenseRules.alcohol'));
        }

        if (policy?.prohibitedExpenses?.gambling) {
            prohibitedExpensesList.push(translate('workspace.rules.individualExpenseRules.gambling'));
        }

        if (policy?.prohibitedExpenses?.hotelIncidentals) {
            prohibitedExpensesList.push(translate('workspace.rules.individualExpenseRules.hotelIncidentals'));
        }

        if (policy?.prohibitedExpenses?.tobacco) {
            prohibitedExpensesList.push(translate('workspace.rules.individualExpenseRules.tobacco'));
        }

        // If no expenses are prohibited, return empty string
        if (!prohibitedExpensesList.length) {
            return '';
        }

        return prohibitedExpensesList.join(', ');
    }, [policy?.prohibitedExpenses, translate]);

    const maxExpenseAmountNoItemizedReceiptText = useMemo(() => {
        if (policy?.maxExpenseAmountNoItemizedReceipt === CONST.DISABLED_MAX_EXPENSE_VALUE || policy?.maxExpenseAmountNoItemizedReceipt === undefined) {
            return '';
        }

        return convertToDisplayString(policy?.maxExpenseAmountNoItemizedReceipt, policyCurrency);
    }, [policy?.maxExpenseAmountNoItemizedReceipt, policyCurrency]);

    const individualExpenseRulesItems: IndividualExpenseRulesMenuItem[] = [
        {
            title: maxExpenseAmountNoReceiptText,
            descriptionTranslationKey: 'workspace.rules.individualExpenseRules.receiptRequiredAmount',
            action: () => Navigation.navigate(ROUTES.RULES_RECEIPT_REQUIRED_AMOUNT.getRoute(policyID)),
            pendingAction: policy?.pendingFields?.maxExpenseAmountNoReceipt,
        },
        {
            title: maxExpenseAmountNoItemizedReceiptText,
            descriptionTranslationKey: 'workspace.rules.individualExpenseRules.itemizedReceiptRequiredAmount',
            action: () => Navigation.navigate(ROUTES.RULES_ITEMIZED_RECEIPT_REQUIRED_AMOUNT.getRoute(policyID)),
            pendingAction: policy?.pendingFields?.maxExpenseAmountNoItemizedReceipt,
        },
        {
            title: maxExpenseAmountText,
            descriptionTranslationKey: 'workspace.rules.individualExpenseRules.maxExpenseAmount',
            action: () => Navigation.navigate(ROUTES.RULES_MAX_EXPENSE_AMOUNT.getRoute(policyID)),
            pendingAction: policy?.pendingFields?.maxExpenseAmount,
        },
        {
            title: maxExpenseAgeText,
            descriptionTranslationKey: 'workspace.rules.individualExpenseRules.maxExpenseAge',
            action: () => Navigation.navigate(ROUTES.RULES_MAX_EXPENSE_AGE.getRoute(policyID)),
            pendingAction: policy?.pendingFields?.maxExpenseAge,
        },
        {
            title: reimbursableModeText,
            descriptionTranslationKey: 'workspace.rules.individualExpenseRules.cashExpenseDefault',
            action: () => Navigation.navigate(ROUTES.RULES_REIMBURSABLE_DEFAULT.getRoute(policyID)),
            pendingAction: policy?.pendingFields?.defaultReimbursable,
        },
        {
            title: billableModeText,
            descriptionTranslationKey: 'workspace.rules.individualExpenseRules.billableDefault',
            action: () => Navigation.navigate(ROUTES.RULES_BILLABLE_DEFAULT.getRoute(policyID)),
            pendingAction: policy?.pendingFields?.defaultBillable,
        },
    ];

    individualExpenseRulesItems.push({
        title: prohibitedExpenses,
        descriptionTranslationKey: 'workspace.rules.individualExpenseRules.prohibitedExpenses',
        action: () => Navigation.navigate(ROUTES.RULES_PROHIBITED_DEFAULT.getRoute(policyID)),
        pendingAction: !isEmptyObject(policy?.prohibitedExpenses?.pendingFields) ? CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE : undefined,
    });

    const areEReceiptsEnabled = policy?.eReceipts ?? false;
    const requireCompanyCardsEnabled = policy?.requireCompanyCardsEnabled ?? false;
    const disableRequireCompanyCardToggle = Object.keys(cardFeeds ?? {}).length === 0;

    // For backwards compatibility with Expensify Classic, we assume that Attendee Tracking is enabled by default on
    // Control policies if the policy does not contain the attribute
    const isAttendeeTrackingEnabled = policy?.isAttendeeTrackingEnabled ?? false;

    return (
        <Section
            isCentralPane
            title={translate('workspace.rules.individualExpenseRules.title')}
            renderSubtitle={() => (
                <IndividualExpenseRulesSectionSubtitle
                    policy={policy}
                    translate={translate}
                    styles={styles}
                    environmentURL={environmentURL}
                />
            )}
            titleStyles={styles.accountSettingsSectionTitle}
        >
            <View style={[styles.mt3]}>
                {individualExpenseRulesItems.map((item) => (
                    <OfflineWithFeedback
                        pendingAction={item.pendingAction}
                        key={translate(item.descriptionTranslationKey)}
                    >
                        <MenuItemWithTopDescription
                            shouldShowRightIcon
                            title={item.title}
                            description={translate(item.descriptionTranslationKey)}
                            onPress={item.action}
                            wrapperStyle={[styles.sectionMenuItemTopDescription]}
                            numberOfLinesTitle={2}
                        />
                    </OfflineWithFeedback>
                ))}
                <ToggleSettingOptionRow
                    title={translate('workspace.rules.individualExpenseRules.requireCompanyCard')}
                    subtitle={translate('workspace.rules.individualExpenseRules.requireCompanyCardDescription')}
                    switchAccessibilityLabel={translate('workspace.rules.individualExpenseRules.requireCompanyCard')}
                    disabled={disableRequireCompanyCardToggle}
                    showLockIcon={disableRequireCompanyCardToggle}
                    wrapperStyle={[styles.mt3]}
                    titleStyle={styles.pv2}
                    subtitleStyle={styles.pt1}
                    isActive={requireCompanyCardsEnabled}
                    pendingAction={policy?.pendingFields?.requireCompanyCardsEnabled}
                    onToggle={() => (policy ? setPolicyRequireCompanyCardsEnabled(policy, !requireCompanyCardsEnabled) : undefined)}
                />

                <ToggleSettingOptionRow
                    title={translate('workspace.rules.individualExpenseRules.eReceipts')}
                    subtitle={translate('workspace.rules.individualExpenseRules.eReceiptsHint')}
                    switchAccessibilityLabel={translate('workspace.rules.individualExpenseRules.eReceipts')}
                    shouldParseSubtitle
                    wrapperStyle={[styles.mt3]}
                    shouldPlaceSubtitleBelowSwitch
                    titleStyle={styles.pv2}
                    subtitleStyle={styles.pt1}
                    isActive={areEReceiptsEnabled}
                    disabled={policyCurrency !== CONST.CURRENCY.USD}
                    onToggle={() => setWorkspaceEReceiptsEnabled(policyID, !areEReceiptsEnabled)}
                    pendingAction={policy?.pendingFields?.eReceipts}
                />
                <ToggleSettingOptionRow
                    title={translate('workspace.rules.individualExpenseRules.attendeeTracking')}
                    subtitle={translate('workspace.rules.individualExpenseRules.attendeeTrackingHint')}
                    switchAccessibilityLabel={translate('workspace.rules.individualExpenseRules.attendeeTracking')}
                    wrapperStyle={[styles.mt3]}
                    shouldPlaceSubtitleBelowSwitch
                    titleStyle={styles.pv2}
                    subtitleStyle={styles.pt1}
                    isActive={isAttendeeTrackingEnabled}
                    onToggle={() => handleAttendeeTrackingToggle(!isAttendeeTrackingEnabled)}
                    pendingAction={policy?.pendingFields?.isAttendeeTrackingEnabled}
                />
            </View>
        </Section>
    );
}

export default IndividualExpenseRulesSection;
