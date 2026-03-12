import {useFocusEffect} from '@react-navigation/native';
import {toZonedTime} from 'date-fns-tz';
import React, {useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import ConfirmModal from '@components/ConfirmModal';
import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues, FormRef} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import ValuePicker from '@components/ValuePicker';
import useCurrencyForExpensifyCard from '@hooks/useCurrencyForExpensifyCard';
import useDefaultFundID from '@hooks/useDefaultFundID';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateExpensifyCardLimitType} from '@libs/actions/Card';
import {openPolicyEditCardLimitTypePage} from '@libs/actions/Policy/Policy';
import {filterInactiveCards, getDefaultExpensifyCardLimitType} from '@libs/CardUtils';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import DateUtils from '@libs/DateUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getApprovalWorkflow} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/EditExpensifyCardLimitTypeForm';
import type {CardLimitType} from '@src/types/onyx/Card';

type WorkspaceEditCardLimitTypePageProps = PlatformStackScreenProps<
    SettingsNavigatorParamList,
    typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_LIMIT_TYPE | typeof SCREENS.EXPENSIFY_CARD.EXPENSIFY_CARD_LIMIT_TYPE
>;

function WorkspaceEditCardLimitTypePage({route}: WorkspaceEditCardLimitTypePageProps) {
    const {policyID, cardID, backTo} = route.params;

    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const formRef = useRef<FormRef | null>(null);
    const {isBetaEnabled} = usePermissions();
    const policy = usePolicy(policyID);
    const defaultFundID = useDefaultFundID(policyID);
    const [cardsList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${defaultFundID}_${CONST.EXPENSIFY_CARD.BANK}`, {selector: filterInactiveCards});

    const card = cardsList?.[cardID];
    const areApprovalsConfigured = getApprovalWorkflow(policy) !== CONST.POLICY.APPROVAL_MODE.OPTIONAL;
    const defaultLimitType = getDefaultExpensifyCardLimitType(policy);
    const initialLimitType = card?.nameValuePairs?.limitType ?? defaultLimitType;
    const promptTranslationKey =
        initialLimitType === CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY || initialLimitType === CONST.EXPENSIFY_CARD.LIMIT_TYPES.FIXED
            ? 'workspace.expensifyCard.changeCardSmartLimitTypeWarning'
            : 'workspace.expensifyCard.changeCardMonthlyLimitTypeWarning';

    const [typeSelected, setTypeSelected] = useState(initialLimitType);
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
    const [expirationToggle, setExpirationToggle] = useState(!!card?.nameValuePairs?.validFrom);

    const currency = useCurrencyForExpensifyCard({policyID});
    const isWorkspaceRhp = route.name === SCREENS.WORKSPACE.EXPENSIFY_CARD_LIMIT_TYPE;

    const personalDetails = usePersonalDetails();

    const assigneePersonalDetails = personalDetails?.[card?.accountID ?? CONST.DEFAULT_NUMBER_ID];
    const assigneeTimeZone = assigneePersonalDetails?.timezone?.selected;

    const minDate = useMemo(() => {
        if (!assigneeTimeZone) {
            return new Date();
        }
        return toZonedTime(new Date(), assigneeTimeZone);
    }, [assigneeTimeZone]);

    const validFromDefaultValue = useMemo(() => {
        const validFrom = card?.nameValuePairs?.validFrom;
        if (!validFrom) {
            return undefined;
        }
        return DateUtils.formatUTCDateTimeToDateInTimezone(validFrom, assigneeTimeZone);
    }, [card?.nameValuePairs?.validFrom, assigneeTimeZone]);

    const validThruDefaultValue = useMemo(() => {
        const validThru = card?.nameValuePairs?.validThru;
        if (!validThru) {
            return undefined;
        }
        return DateUtils.formatUTCDateTimeToDateInTimezone(validThru, assigneeTimeZone);
    }, [card?.nameValuePairs?.validThru, assigneeTimeZone]);

    const goBack = () => {
        if (backTo) {
            Navigation.goBack(backTo);
            return;
        }
        Navigation.goBack(isWorkspaceRhp ? ROUTES.WORKSPACE_EXPENSIFY_CARD_DETAILS.getRoute(policyID, cardID) : ROUTES.EXPENSIFY_CARD_DETAILS.getRoute(policyID, cardID));
    };

    const fetchCardLimitTypeData = () => {
        openPolicyEditCardLimitTypePage(policyID, Number(cardID));
    };

    useFocusEffect(fetchCardLimitTypeData);

    const updateCardLimitType = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.EDIT_EXPENSIFY_CARD_LIMIT_TYPE_FORM>) => {
        setIsConfirmModalVisible(false);
        updateExpensifyCardLimitType(
            defaultFundID,
            Number(cardID),
            typeSelected,
            assigneeTimeZone,
            card?.nameValuePairs,
            values[INPUT_IDS.VALID_FROM],
            values[INPUT_IDS.VALID_THRU],
            !expirationToggle,
        );
        goBack();
    };

    const submit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.EDIT_EXPENSIFY_CARD_LIMIT_TYPE_FORM>) => {
        let shouldShowConfirmModal = false;
        if (!!card?.unapprovedSpend && card?.nameValuePairs?.unapprovedExpenseLimit) {
            // Spends are coming as negative numbers from the backend and we need to make it positive for the correct expression.
            const unapprovedSpend = Math.abs(card.unapprovedSpend);
            const isUnapprovedSpendOverLimit = unapprovedSpend >= card.nameValuePairs.unapprovedExpenseLimit;

            const validCombinations = [
                [CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY, CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART],
                [CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART, CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY],
                [CONST.EXPENSIFY_CARD.LIMIT_TYPES.FIXED, CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART],
                [CONST.EXPENSIFY_CARD.LIMIT_TYPES.FIXED, CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY],
            ];
            // Check if the combination exists in validCombinations
            const isValidCombination = validCombinations.some(([limitType, selectedType]) => initialLimitType === limitType && typeSelected === selectedType);

            if (isValidCombination && isUnapprovedSpendOverLimit) {
                shouldShowConfirmModal = true;
            }
        }

        if (shouldShowConfirmModal) {
            setIsConfirmModalVisible(true);
        } else {
            updateCardLimitType(values);
        }
    };

    let shouldShowFixedOption = true;

    if (card?.totalSpend && card?.nameValuePairs?.unapprovedExpenseLimit) {
        const totalSpend = Math.abs(card.totalSpend);
        if (
            (initialLimitType === CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY || initialLimitType === CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART) &&
            totalSpend >= card.nameValuePairs?.unapprovedExpenseLimit
        ) {
            shouldShowFixedOption = false;
        }
    }

    const data = useMemo(() => {
        const options = [];

        if (areApprovalsConfigured) {
            options.push({
                value: CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART,
                label: translate('workspace.card.issueNewCard.smartLimit'),
                description: translate('workspace.card.issueNewCard.smartLimitDescription'),
                keyForList: CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART,
                isSelected: typeSelected === CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART,
            });
        }

        options.push({
            value: CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY,
            label: translate('workspace.card.issueNewCard.monthly'),
            description: translate('workspace.card.issueNewCard.monthlyDescription'),
            keyForList: CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY,
            isSelected: typeSelected === CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY,
        });

        if (shouldShowFixedOption) {
            options.push({
                value: CONST.EXPENSIFY_CARD.LIMIT_TYPES.FIXED,
                label: translate('workspace.card.issueNewCard.fixedAmount'),
                description: translate('workspace.card.issueNewCard.fixedAmountDescription'),
                keyForList: CONST.EXPENSIFY_CARD.LIMIT_TYPES.FIXED,
                isSelected: typeSelected === CONST.EXPENSIFY_CARD.LIMIT_TYPES.FIXED,
            });
        }

        if (card?.nameValuePairs?.isVirtual && isBetaEnabled(CONST.BETAS.SINGLE_USE_AND_EXPIRE_BY_CARDS)) {
            options.push({
                value: CONST.EXPENSIFY_CARD.LIMIT_TYPES.SINGLE_USE,
                label: translate('workspace.card.issueNewCard.singleUse'),
                description: translate('workspace.card.issueNewCard.singleUseDescription'),
                keyForList: CONST.EXPENSIFY_CARD.LIMIT_TYPES.SINGLE_USE,
                isSelected: typeSelected === CONST.EXPENSIFY_CARD.LIMIT_TYPES.SINGLE_USE,
            });
        }
        return options;
    }, [areApprovalsConfigured, translate, typeSelected, shouldShowFixedOption, card?.nameValuePairs?.isVirtual, isBetaEnabled]);

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.EDIT_EXPENSIFY_CARD_LIMIT_TYPE_FORM>) => {
        if (!expirationToggle) {
            return {};
        }
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.EDIT_EXPENSIFY_CARD_LIMIT_TYPE_FORM> = {};
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
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}
        >
            <ScreenWrapper
                testID="WorkspaceEditCardLimitTypePage"
                shouldEnablePickerAvoiding={false}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.card.issueNewCard.limitType')}
                    onBackButtonPress={goBack}
                />
                <FullPageOfflineBlockingView addBottomSafeAreaPadding>
                    <FormProvider
                        ref={formRef}
                        formID={ONYXKEYS.FORMS.EDIT_EXPENSIFY_CARD_LIMIT_TYPE_FORM}
                        submitButtonText={translate('common.save')}
                        shouldHideFixErrorsAlert
                        onSubmit={submit}
                        style={[styles.flex1]}
                        disablePressOnEnter={false}
                        submitButtonStyles={[styles.mh5]}
                        validate={validate}
                        enabledWhenOffline
                        addBottomSafeAreaPadding
                    >
                        <InputWrapper
                            InputComponent={ValuePicker}
                            inputID={INPUT_IDS.LIMIT_TYPE}
                            label={translate('workspace.card.issueNewCard.chooseLimitType')}
                            value={typeSelected}
                            defaultValue={initialLimitType}
                            items={data}
                            onValueChange={(value) => {
                                setTypeSelected(value as CardLimitType);
                            }}
                            shouldShowModal={false}
                            addBottomSafeAreaPadding={false}
                            alternateNumberOfSupportedLines={2}
                        />

                        {!!card?.nameValuePairs?.isVirtual && isBetaEnabled(CONST.BETAS.SINGLE_USE_AND_EXPIRE_BY_CARDS) && (
                            <>
                                <View style={[styles.threadDividerLine, styles.flexGrow0, styles.ml5, styles.mr5, styles.mv3]} />
                                <View style={[styles.ph5]}>
                                    <ToggleSettingOptionRow
                                        title={translate('workspace.card.issueNewCard.setExpiryDate')}
                                        subtitle={!expirationToggle ? translate('workspace.card.issueNewCard.setExpiryDateDescription') : ''}
                                        isActive={expirationToggle}
                                        onToggle={setExpirationToggle}
                                        switchAccessibilityLabel={translate('workspace.card.issueNewCard.setExpiryDate')}
                                        shouldPlaceSubtitleBelowSwitch
                                        wrapperStyle={[styles.mv3]}
                                    />
                                    {expirationToggle && (
                                        <>
                                            <Text style={[styles.textLabelSupporting, styles.mb1, styles.mt2]}>{translate('workspace.card.issueNewCard.validFrom')}</Text>
                                            <InputWrapper
                                                InputComponent={DatePicker}
                                                inputID={INPUT_IDS.VALID_FROM}
                                                label={translate('workspace.card.issueNewCard.startDate')}
                                                maxDate={CONST.CALENDAR_PICKER.MAX_DATE}
                                                minDate={minDate}
                                                defaultValue={validFromDefaultValue}
                                            />
                                            <InputWrapper
                                                InputComponent={DatePicker}
                                                inputID={INPUT_IDS.VALID_THRU}
                                                label={translate('workspace.card.issueNewCard.endDate')}
                                                maxDate={CONST.CALENDAR_PICKER.MAX_DATE}
                                                minDate={minDate}
                                                defaultValue={validThruDefaultValue}
                                            />
                                        </>
                                    )}
                                </View>
                            </>
                        )}
                    </FormProvider>
                    <ConfirmModal
                        title={translate('workspace.expensifyCard.changeCardLimitType')}
                        isVisible={isConfirmModalVisible}
                        onConfirm={() => formRef.current?.submit()}
                        onCancel={() => setIsConfirmModalVisible(false)}
                        prompt={translate(promptTranslationKey, convertToDisplayString(card?.nameValuePairs?.unapprovedExpenseLimit, currency))}
                        confirmText={translate('workspace.expensifyCard.changeLimitType')}
                        cancelText={translate('common.cancel')}
                        danger
                        shouldEnableNewFocusManagement
                    />
                </FullPageOfflineBlockingView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceEditCardLimitTypePage;
