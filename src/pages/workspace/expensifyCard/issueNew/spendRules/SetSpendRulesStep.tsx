import {format, toZonedTime} from 'date-fns-tz';
import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import SpendRuleRestrictionTypeToggle from '@components/SpendRules/SpendRuleRestrictionTypeToggle';
import TabSelectorBase from '@components/TabSelector/TabSelectorBase';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {setIssueNewCardData, setIssueNewCardStepAndData} from '@libs/actions/Card';
import Navigation from '@navigation/Navigation';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/IssueNewExpensifyCardForm';
import type Policy from '@src/types/onyx/Policy';

type SetSpendRulesStepProps = {
    /* The policy that the card will be issued under */
    policyID: string;

    /** Start from step index */
    startStepIndex: number;

    /** Array of step names */
    stepNames: readonly string[];
};

function SetSpendRulesStep({policyID, stepNames, startStepIndex}: SetSpendRulesStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const personalDetails = usePersonalDetails();
    const icons = useMemoizedLazyExpensifyIcons(['Copy', 'Pencil']);
    const [issueNewCard] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_ISSUE_NEW_EXPENSIFY_CARD}${policyID}`);

    const assigneePersonalDetails = Object.values(personalDetails ?? {}).find((detail) => detail?.login === issueNewCard?.data?.assigneeEmail);
    const assigneeTimeZone = assigneePersonalDetails?.timezone?.selected;

    const minDate = useMemo(() => {
        if (!assigneeTimeZone) {
            return new Date();
        }
        return toZonedTime(new Date(), assigneeTimeZone);
    }, [assigneeTimeZone]);

    const isEditing = issueNewCard?.isEditing;
    const hasCardRuleID = !!issueNewCard?.data?.cardRuleID;
    const spendRuleForm = issueNewCard?.data.cardRuleValue ?? {};
    const hasCardRuleData = !!issueNewCard?.data?.cardRuleID || !!issueNewCard?.data?.cardRuleValue;
    const restrictionAction = issueNewCard?.data?.cardRuleValue?.restrictionAction ?? CONST.SPEND_RULES.ACTION.ALLOW;
    const spendRuleOption = issueNewCard?.data?.spendRuleOption ?? CONST.EXPENSIFY_CARD.CARD_RULE_OPTION.COPY_EXISTING;

    // JACK_TODO: Derive from state
    const [spendRuleEnabled, setSpendRulesEnabled] = useState(hasCardRuleData);
    const [expirationToggled, setExpirationToggled] = useState(!!issueNewCard?.data?.validFrom);

    const spendRuleTabs = [
        {
            key: CONST.EXPENSIFY_CARD.CARD_RULE_OPTION.COPY_EXISTING,
            title: 'Copy existing',
            icon: icons.Copy,
        },
        {
            key: CONST.EXPENSIFY_CARD.CARD_RULE_OPTION.CREATE_NEW,
            title: 'Create new',
            icon: icons.Pencil,
        },
    ];

    const handleChooseSpendRule = () => {
        if (!policyID) {
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_RULE_SELECTION.getRoute(policyID));
    };

    const handleSpendRuleOptionSelection = (option: string) => {
        if (!policyID) {
            return;
        }

        setIssueNewCardData(policyID, {spendRuleOption: option as ValueOf<typeof CONST.EXPENSIFY_CARD.CARD_RULE_OPTION>});
    };

    const handleSelectRestrictionAction = (action: string) => {
        if (!policyID) {
            return;
        }

        setIssueNewCardData(policyID, {
            cardRuleValue: {
                ...issueNewCard?.data?.cardRuleValue,
                restrictionAction: action as ValueOf<typeof CONST.SPEND_RULES.ACTION>,
            },
        });
    };

    const handleBackButtonPress = () => {
        if (isEditing) {
            setIssueNewCardStepAndData({step: CONST.EXPENSIFY_CARD.STEP.CONFIRMATION, isEditing: false, policyID});
            return;
        }
        setIssueNewCardStepAndData({step: CONST.EXPENSIFY_CARD.STEP.LIMIT_TYPE, policyID});
    };

    const submit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM>) => {
        setIssueNewCardStepAndData({
            step: isEditing ? CONST.EXPENSIFY_CARD.STEP.CONFIRMATION : CONST.EXPENSIFY_CARD.STEP.CARD_NAME,
            data: expirationToggled ? {validFrom: values.validFrom, validThru: values.validThru} : {validFrom: '', validThru: ''},
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
                <ToggleSettingOptionRow
                    title={translate('workspace.card.issueNewCard.addSpendRule')}
                    isActive={spendRuleEnabled}
                    onToggle={setSpendRulesEnabled}
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

                        {spendRuleOption === CONST.EXPENSIFY_CARD.CARD_RULE_OPTION.COPY_EXISTING && (
                            <MenuItemWithTopDescription
                                // JACK_TODO
                                title={hasCardRuleID ? 'Has a card rule selected' : ''}
                                shouldShowRightIcon
                                description="Choose a rule"
                                onPress={handleChooseSpendRule}
                                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.EXPENSIFY_CARD.CHOOSE_SPEND_RULE}
                            />
                        )}

                        {spendRuleOption === CONST.EXPENSIFY_CARD.CARD_RULE_OPTION.CREATE_NEW && (
                            <View>
                                <View style={[styles.ph5, styles.pv3]}>
                                    <SpendRuleRestrictionTypeToggle
                                        restrictionAction={restrictionAction}
                                        onSelect={handleSelectRestrictionAction}
                                    />
                                </View>
                                <MenuItemWithTopDescription
                                    shouldShowRightIcon
                                    numberOfLinesTitle={2}
                                    titleStyle={styles.flex1}
                                    // title={getMerchantMenuTitle(spendRuleForm?.merchantNames)}
                                    description={translate('common.merchant')}
                                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.MERCHANT_RULE_SECTION_ITEM}
                                    onPress={() => {
                                        Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_RULE_MERCHANTS.getRoute(policyID));
                                    }}
                                />
                                <MenuItemWithTopDescription
                                    shouldShowRightIcon
                                    numberOfLinesTitle={2}
                                    titleStyle={styles.flex1}
                                    // title={categoriesMenuTitle}
                                    description={translate('workspace.rules.spendRules.spendCategory')}
                                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.MERCHANT_RULE_SECTION_ITEM}
                                    onPress={() => {
                                        Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_RULE_CATEGORY.getRoute(policyID));
                                    }}
                                />
                                <MenuItemWithTopDescription
                                    shouldShowRightIcon
                                    // title={maxAmountMenuTitle}
                                    titleStyle={styles.flex1}
                                    description={translate('workspace.rules.spendRules.maxAmount')}
                                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.MERCHANT_RULE_SECTION_ITEM}
                                    onPress={() => {
                                        Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_RULE_MAX_AMOUNT.getRoute(policyID));
                                    }}
                                />
                            </View>
                        )}
                    </View>
                )}
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
            </FormProvider>
        </InteractiveStepWrapper>
    );
}

export default SetSpendRulesStep;
