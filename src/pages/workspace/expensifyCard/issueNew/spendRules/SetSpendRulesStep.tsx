import {format, toZonedTime} from 'date-fns-tz';
import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import FormHelpMessage from '@components/FormHelpMessage';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import SpendRuleRestrictionTypeToggle from '@components/SpendRules/SpendRuleRestrictionTypeToggle';
import TabSelectorBase from '@components/TabSelector/TabSelectorBase';
import Text from '@components/Text';
import useDefaultFundID from '@hooks/useDefaultFundID';
import useEnvironment from '@hooks/useEnvironment';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {setIssueNewCardData, setIssueNewCardStepAndData} from '@libs/actions/Card';
import {convertToBackendAmount, convertToDisplayString} from '@libs/CurrencyUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import {isPolicyFeatureEnabled} from '@libs/PolicyUtils';
import {getSpendRuleFormValuesFromCardRule, getSpendRuleSummaryText, getTruncatedSpendRuleSummary} from '@libs/SpendRulesUtils';
import Navigation from '@navigation/Navigation';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/IssueNewExpensifyCardForm';
import {IssueNewCardData} from '@src/types/onyx/Card';

type SetSpendRulesStepProps = {
    /* The policy that the card will be issued under */
    policyID: string;

    /** Start from step index */
    startStepIndex: number;

    /** Array of step names */
    stepNames: readonly string[];
};

function SetSpendRulesStep({policyID, stepNames, startStepIndex}: SetSpendRulesStepProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isProduction} = useEnvironment();
    const personalDetails = usePersonalDetails();
    const domainAccountID = useDefaultFundID(policyID);
    const icons = useMemoizedLazyExpensifyIcons(['Copy', 'Pencil']);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const [issueNewCard] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_ISSUE_NEW_EXPENSIFY_CARD}${policyID}`);
    const [expensifyCardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${domainAccountID}`);

    const [spendRuleErrorMessage, setSpendRuleErrorMessage] = useState('');
    const [isRestrictMerchantsOff, setIsRestrictMerchantsOff] = useState(true);
    const [expirationToggled, setExpirationToggled] = useState(!!issueNewCard?.data?.validFrom);

    const isEditing = issueNewCard?.isEditing;
    const currencyCode = issueNewCard?.data?.currency ?? CONST.CURRENCY.USD;
    const isVirtualCard = issueNewCard?.data?.cardType === CONST.EXPENSIFY_CARD.CARD_TYPE.VIRTUAL;
    const isSpendRuleVisible = !isProduction && isPolicyFeatureEnabled(policy, CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED);

    const spendRuleID = issueNewCard?.data?.spendRuleID;
    const spendRuleForm = issueNewCard?.data.spendRuleValue ?? {};
    const spendRuleEnabled = issueNewCard?.data.spendRuleEnabled ?? false;
    const spendRuleAction = spendRuleForm.restrictionAction ?? CONST.SPEND_RULES.ACTION.ALLOW;
    const spendRuleOption = issueNewCard?.data?.spendRuleOption ?? CONST.EXPENSIFY_CARD.SPEND_RULE_OPTION.COPY_EXISTING;

    const spendRuleToCopy = spendRuleID ? expensifyCardSettings?.cardRules?.[spendRuleID] : undefined;
    const spendRoleToCopyFormValue = getSpendRuleFormValuesFromCardRule(spendRuleToCopy);
    const spendRuleToCopySummary = spendRoleToCopyFormValue ? getSpendRuleSummaryText(spendRoleToCopyFormValue, currencyCode, translate, convertToDisplayString) : [];

    const assigneePersonalDetails = Object.values(personalDetails ?? {}).find((detail) => detail?.login === issueNewCard?.data?.assigneeEmail);
    const assigneeTimeZone = assigneePersonalDetails?.timezone?.selected;

    const minDate = useMemo(() => {
        if (!assigneeTimeZone) {
            return new Date();
        }
        return toZonedTime(new Date(), assigneeTimeZone);
    }, [assigneeTimeZone]);

    const spendRuleTabs = [
        {
            key: CONST.EXPENSIFY_CARD.SPEND_RULE_OPTION.COPY_EXISTING,
            title: translate('workspace.card.issueNewCard.copyExisting'),
            icon: icons.Copy,
        },
        {
            key: CONST.EXPENSIFY_CARD.SPEND_RULE_OPTION.CREATE_NEW,
            title: translate('workspace.card.issueNewCard.createNew'),
            icon: icons.Pencil,
        },
    ];

    const handleToggleSpendRules = (isEnabled: boolean) => {
        if (!policyID) {
            return;
        }
        setSpendRuleErrorMessage('');
        setIssueNewCardData(policyID, {spendRuleEnabled: isEnabled});
    };

    const handleChooseSpendRule = () => {
        if (!policyID) {
            return;
        }
        setSpendRuleErrorMessage('');
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW_SPEND_RULE_SELECTION.path));
    };

    const handleSpendRuleOptionSelection = (option: string) => {
        if (!policyID) {
            return;
        }

        setSpendRuleErrorMessage('');
        setIssueNewCardData(policyID, {spendRuleOption: option as ValueOf<typeof CONST.EXPENSIFY_CARD.SPEND_RULE_OPTION>});
    };

    const handleSelectRestrictionAction = (action: ValueOf<typeof CONST.SPEND_RULES.ACTION> | null) => {
        if (!policyID) {
            return;
        }

        setSpendRuleErrorMessage('');

        if (action === null) {
            setIsRestrictMerchantsOff(true);
            return;
        }

        setIsRestrictMerchantsOff(false);
        setIssueNewCardData(policyID, {spendRuleValue: {restrictionAction: action}});
    };

    const handleBackButtonPress = () => {
        if (isEditing) {
            setIssueNewCardStepAndData({step: CONST.EXPENSIFY_CARD.STEP.CONFIRMATION, isEditing: false, policyID});
            return;
        }

        setIssueNewCardStepAndData({step: CONST.EXPENSIFY_CARD.STEP.LIMIT_TYPE, policyID});
    };

    const hasMaxAmount = !!spendRuleForm.maxAmount?.trim();
    const hasAnyCategory = !!spendRuleForm.categories?.length && !isRestrictMerchantsOff;
    const hasAnyMerchant = !!spendRuleForm.merchantNames?.some((name) => name.trim() !== '') && !isRestrictMerchantsOff;
    const hasAnyRuleApplied = hasAnyMerchant || hasAnyCategory || hasMaxAmount;

    const getSpendRuleErrorMessage = useCallback(() => {
        if (!spendRuleEnabled) {
            return '';
        }

        if (spendRuleOption === CONST.EXPENSIFY_CARD.SPEND_RULE_OPTION.COPY_EXISTING && !spendRuleID) {
            return translate('workspace.card.chooseRule');
        }

        if (spendRuleOption === CONST.EXPENSIFY_CARD.SPEND_RULE_OPTION.CREATE_NEW && !hasAnyRuleApplied) {
            return translate('workspace.rules.spendRules.confirmErrorApplyAtLeastOneSpendRule');
        }

        return '';
    }, [hasAnyRuleApplied, spendRuleEnabled, spendRuleID, spendRuleOption, translate]);

    const submit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM>) => {
        const formSpendRuleError = getSpendRuleErrorMessage();

        if (formSpendRuleError) {
            setSpendRuleErrorMessage(formSpendRuleError);
            return;
        }

        const spendRuleData = spendRuleEnabled ? issueNewCard?.data.spendRuleValue : {};

        // If the user is not adding merchant rules, we should remove that data before navigating to
        // the next step
        const issueNewCardData: Partial<IssueNewCardData> = {
            ...(expirationToggled ? {validFrom: values.validFrom, validThru: values.validThru} : {validFrom: '', validThru: ''}),
            spendRuleValue: {
                ...spendRuleData,
                categories: !isRestrictMerchantsOff ? spendRuleData?.categories : [],
                merchantNames: !isRestrictMerchantsOff ? spendRuleData?.merchantNames : [],
                merchantMatchTypes: !isRestrictMerchantsOff ? spendRuleData?.merchantMatchTypes : [],
            },
        };

        setSpendRuleErrorMessage('');
        setIssueNewCardStepAndData({
            step: isEditing ? CONST.EXPENSIFY_CARD.STEP.CONFIRMATION : CONST.EXPENSIFY_CARD.STEP.CARD_NAME,
            data: issueNewCardData,
            isEditing: false,
            policyID,
        });
    };

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM>) => {
        if (!expirationToggled) {
            return {};
        }
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM> = {};
        if (!values[INPUT_IDS.VALID_FROM]) {
            errors[INPUT_IDS.VALID_FROM] = translate('workspace.card.issueNewCard.enterValidDate');
        }
        if (!values[INPUT_IDS.VALID_THRU]) {
            errors[INPUT_IDS.VALID_THRU] = translate('workspace.card.issueNewCard.enterValidDate');
        }

        if (values[INPUT_IDS.VALID_FROM] && values[INPUT_IDS.VALID_THRU]) {
            const startDate = new Date(values[INPUT_IDS.VALID_FROM]);
            const endDate = new Date(values[INPUT_IDS.VALID_THRU]);

            if (endDate < startDate) {
                errors[INPUT_IDS.VALID_THRU] = translate('iou.error.endDateBeforeStartDate');
            }
        }
        return errors;
    };

    const spendRuleParsedMaxAmount = Number.parseFloat(spendRuleForm.maxAmount ?? '');
    const spendRuleMerchantNamesTitle = getTruncatedSpendRuleSummary(spendRuleForm.merchantNames, (summary, count) =>
        translate('workspace.rules.spendRules.summaryMoreCount', {summary, count}),
    );
    const spendRuleCategoriesTitle = getTruncatedSpendRuleSummary(
        spendRuleForm.categories?.map((category) => translate(`workspace.rules.spendRules.categoryOptions.${category}`)),
        (summary, count) => translate('workspace.rules.spendRules.summaryMoreCount', {summary, count}),
    );

    const existingSpendRuleTitle = spendRuleToCopySummary.join(', ');
    const currenciesTitle = spendRuleForm.currencies?.join(', ') ?? '';
    const spendRuleMaxAmountTitle = Number.isFinite(spendRuleParsedMaxAmount) ? convertToDisplayString(convertToBackendAmount(spendRuleParsedMaxAmount), currencyCode) : '';

    return (
        <InteractiveStepWrapper
            wrapperID="SetExpiryOptions"
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            headerTitle={translate('workspace.card.issueCard')}
            handleBackButtonPress={handleBackButtonPress}
            startStepIndex={startStepIndex}
            stepNames={stepNames}
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <FormProvider
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM}
                onSubmit={submit}
                submitButtonText={isEditing ? translate('common.confirm') : translate('common.next')}
                enabledWhenOffline
                shouldHideFixErrorsAlert
                validate={validate}
            >
                <Text style={[styles.textHeadlineLineHeightXXL, styles.mv3]}>{translate('workspace.card.issueNewCard.setCardRules')}</Text>
                {isSpendRuleVisible && (
                    <>
                        <ToggleSettingOptionRow
                            title={translate('workspace.card.issueNewCard.addSpendRule')}
                            isActive={spendRuleEnabled}
                            onToggle={handleToggleSpendRules}
                            switchAccessibilityLabel={translate('workspace.card.issueNewCard.addSpendRule')}
                            wrapperStyle={[styles.mv3]}
                        />
                        {spendRuleEnabled && (
                            <View style={[styles.pt4, styles.border, styles.borderRadiusComponentLarge, styles.overflowHidden]}>
                                <TabSelectorBase
                                    equalWidth
                                    tabs={spendRuleTabs}
                                    activeTabKey={spendRuleOption}
                                    onTabPress={handleSpendRuleOptionSelection}
                                />

                                {spendRuleOption === CONST.EXPENSIFY_CARD.SPEND_RULE_OPTION.COPY_EXISTING && (
                                    <MenuItemWithTopDescription
                                        shouldShowRightIcon
                                        title={existingSpendRuleTitle}
                                        description={translate('workspace.card.chooseRule')}
                                        onPress={handleChooseSpendRule}
                                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.EXPENSIFY_CARD.CHOOSE_SPEND_RULE}
                                    />
                                )}

                                {spendRuleOption === CONST.EXPENSIFY_CARD.SPEND_RULE_OPTION.CREATE_NEW && (
                                    <View>
                                        <MenuItemWithTopDescription
                                            shouldShowRightIcon
                                            title={spendRuleMaxAmountTitle}
                                            titleStyle={styles.flex1}
                                            description={translate('workspace.rules.spendRules.maxAmount')}
                                            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.MERCHANT_RULE_SECTION_ITEM}
                                            onPress={() => {
                                                setSpendRuleErrorMessage('');
                                                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW_SPEND_RULE_MAX_AMOUNT.path));
                                            }}
                                        />
                                        <MenuItemWithTopDescription
                                            description={translate('workspace.rules.spendRules.permittedCurrencies')}
                                            onPress={() => {
                                                setSpendRuleErrorMessage('');
                                                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW_SPEND_RULE_CURRENCY.path));
                                            }}
                                            shouldShowRightIcon
                                            title={currenciesTitle}
                                            titleStyle={styles.flex1}
                                            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.CURRENCY_SELECTOR}
                                        />

                                        <View style={[styles.ph5, styles.pv3]}>
                                            <SpendRuleRestrictionTypeToggle
                                                restrictionAction={!isRestrictMerchantsOff ? spendRuleAction : null}
                                                onSelect={handleSelectRestrictionAction}
                                            />
                                        </View>
                                        {!isRestrictMerchantsOff && (
                                            <>
                                                <MenuItemWithTopDescription
                                                    shouldShowRightIcon
                                                    numberOfLinesTitle={2}
                                                    titleStyle={styles.flex1}
                                                    title={spendRuleMerchantNamesTitle}
                                                    description={translate('common.merchant')}
                                                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.MERCHANT_RULE_SECTION_ITEM}
                                                    onPress={() => {
                                                        setSpendRuleErrorMessage('');
                                                        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW_SPEND_RULE_MERCHANTS.path));
                                                    }}
                                                />
                                                <MenuItemWithTopDescription
                                                    shouldShowRightIcon
                                                    numberOfLinesTitle={2}
                                                    titleStyle={styles.flex1}
                                                    title={spendRuleCategoriesTitle}
                                                    description={translate('workspace.rules.spendRules.merchantTypes')}
                                                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.MERCHANT_RULE_SECTION_ITEM}
                                                    onPress={() => {
                                                        setSpendRuleErrorMessage('');
                                                        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW_SPEND_RULE_CATEGORY.path));
                                                    }}
                                                />
                                            </>
                                        )}
                                    </View>
                                )}
                            </View>
                        )}
                        {!!spendRuleErrorMessage && <FormHelpMessage message={spendRuleErrorMessage} />}
                    </>
                )}

                {isVirtualCard && (
                    <>
                        <ToggleSettingOptionRow
                            title={translate('workspace.card.issueNewCard.addExpirationDate')}
                            subtitle={!expirationToggled ? translate('workspace.card.issueNewCard.addExpirationDateDescription') : ''}
                            isActive={expirationToggled}
                            onToggle={setExpirationToggled}
                            switchAccessibilityLabel={translate('workspace.card.issueNewCard.addExpirationDate')}
                            shouldPlaceSubtitleBelowSwitch
                            wrapperStyle={[styles.mv3]}
                        />
                        {expirationToggled && (
                            <>
                                <Text style={[styles.textLabelSupporting, styles.mb1, styles.mt2]}>{translate('workspace.card.issueNewCard.validFrom')}</Text>
                                <InputWrapper
                                    InputComponent={DatePicker}
                                    inputID={INPUT_IDS.VALID_FROM}
                                    label={translate('workspace.card.issueNewCard.startDate')}
                                    maxDate={CONST.CALENDAR_PICKER.MAX_DATE}
                                    minDate={minDate}
                                    defaultValue={issueNewCard?.data?.validFrom ?? format(minDate, CONST.DATE.FNS_FORMAT_STRING)}
                                />
                                <InputWrapper
                                    InputComponent={DatePicker}
                                    inputID={INPUT_IDS.VALID_THRU}
                                    label={translate('workspace.card.issueNewCard.endDate')}
                                    maxDate={CONST.CALENDAR_PICKER.MAX_DATE}
                                    minDate={minDate}
                                    defaultValue={issueNewCard?.data?.validThru}
                                />
                            </>
                        )}
                    </>
                )}
            </FormProvider>
        </InteractiveStepWrapper>
    );
}

export default SetSpendRulesStep;
