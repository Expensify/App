import Button from '@components/ButtonComposed';
import NumberWithSymbolForm from '@components/NumberWithSymbolForm';
import type {NumberWithSymbolFormRef} from '@components/NumberWithSymbolForm';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';

import useBlockDistanceRequest from '@hooks/useBlockDistanceRequest';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useDefaultExpensePolicy from '@hooks/useDefaultExpensePolicy';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useDiscardChangesConfirmation from '@hooks/useDiscardChangesConfirmation';
import useDistanceRateOriginalPolicy from '@hooks/useDistanceRateOriginalPolicy';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useMoneyRequestParticipantsPolicyTags from '@hooks/useMoneyRequestParticipantsPolicyTags';
import useMoneyRequestPolicyTagsForReport from '@hooks/useMoneyRequestPolicyTagsForReport';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import usePolicyForTransaction from '@hooks/usePolicyForTransaction';
import useReportAttributes from '@hooks/useReportAttributes';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSelfDMReport from '@hooks/useSelfDMReport';
import useThemeStyles from '@hooks/useThemeStyles';

import {setMoneyRequestDistance} from '@libs/actions/IOU/MoneyRequest';
import {setDraftSplitTransaction} from '@libs/actions/IOU/Split';
import {updateMoneyRequestDistance} from '@libs/actions/IOU/UpdateMoneyRequest';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {shouldUseTransactionDraft} from '@libs/IOUUtils';
import {getStringFieldHasUnsavedChanges} from '@libs/MoneyRequestUtils';
import Navigation from '@libs/Navigation/Navigation';
import {rand64, roundToTwoDecimalPlaces} from '@libs/NumberUtils';
import {isTrackOnboardingChoice} from '@libs/OnboardingUtils';
import {generateReportID, isMoneyRequestReport as isMoneyRequestReportReportUtils, isPolicyExpenseChat as isPolicyExpenseChatUtils} from '@libs/ReportUtils';
import shouldUseDefaultExpensePolicyUtil from '@libs/shouldUseDefaultExpensePolicy';
import {getDistanceInMeters} from '@libs/TransactionUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import {hasSeenTourSelector} from '@src/selectors/Onboarding';
import {personalDetailsLoginSelector} from '@src/selectors/PersonalDetails';
import {validTransactionDraftIDsSelector} from '@src/selectors/TransactionDraft';
import type Transaction from '@src/types/onyx/Transaction';

import type {OnyxEntry} from 'react-native-onyx';

import {useFocusEffect} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';

import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';

import handleMoneyRequestStepDistanceNavigation from './IOURequestStepDistance/handleMoneyRequestStepDistanceNavigation';
import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type DynamicIOURequestStepDistanceManualProps = WithCurrentUserPersonalDetailsProps &
    WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.DYNAMIC_STEP_DISTANCE_MANUAL | typeof SCREENS.MONEY_REQUEST.DISTANCE_CREATE> & {
        /** The transaction object being modified in Onyx */
        transaction: OnyxEntry<Transaction>;
    };

function DynamicIOURequestStepDistanceManual({
    report,
    route: {
        params: {action, iouType, reportID, transactionID, backToReport},
        name,
    },
    transaction,
    currentUserPersonalDetails,
}: DynamicIOURequestStepDistanceManualProps) {
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_DISTANCE_MANUAL.path);
    // The page is also mounted on the static distance create screen, where there is nothing to go back to within the flow.
    const backTo = name === SCREENS.MONEY_REQUEST.DYNAMIC_STEP_DISTANCE_MANUAL ? backPath : undefined;
    const {translate, formatPhoneNumber, dateFnsLocale} = useLocalize();
    const {isOffline} = useNetwork();
    const {getCurrencyDecimals, getCurrencySymbol} = useCurrencyListActions();
    const styles = useThemeStyles();
    const {isBetaEnabled} = usePermissions();
    const {isExtraSmallScreenHeight} = useResponsiveLayout();

    const isArchived = useReportIsArchived(report?.reportID);
    const selfDMReport = useSelfDMReport();
    const {policy} = usePolicyForTransaction({
        reportPolicyID: report?.policyID,
        action,
        iouType,
        transaction,
    });
    const personalPolicy = usePersonalPolicy();
    const defaultExpensePolicy = useDefaultExpensePolicy();
    const {policyForMovingExpenses} = usePolicyForMovingExpenses();
    const reportAttributesDerived = useReportAttributes();

    const [selectedTab] = useOnyx(`${ONYXKEYS.COLLECTION.SELECTED_TAB}${CONST.TAB.DISTANCE_REQUEST_TYPE}`);
    const distanceOriginalPolicy = useDistanceRateOriginalPolicy(transaction?.comment?.customUnit?.customUnitRateID);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policy?.id}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policy?.id}`);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [skipConfirmation] = useOnyx(`${ONYXKEYS.COLLECTION.SKIP_CONFIRMATION}${transactionID}`);
    const [lastSelectedDistanceRates] = useOnyx(ONYXKEYS.NVP_LAST_SELECTED_DISTANCE_RATES);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE);
    const [policyRecentlyUsedCurrencies] = useOnyx(ONYXKEYS.RECENTLY_USED_CURRENCIES);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.parentReportID)}`);
    const [iouReportOwnerLogin] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsLoginSelector(parentReport?.ownerAccountID)});
    const [reportPolicyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(parentReport?.policyID)}`);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {
        selector: validTransactionDraftIDsSelector,
    });
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {
        selector: hasSeenTourSelector,
    });
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [conciergeChat] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${conciergeReportID}`);
    const [splitDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`);
    const [recentWaypoints] = useOnyx(ONYXKEYS.NVP_RECENT_WAYPOINTS);
    const reportIDToCheck = isMoneyRequestReportReportUtils(report) ? report?.chatReportID : report?.reportID;
    const [reportDraft] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${reportIDToCheck}`);
    const textInput = useRef<BaseTextInputRef | null>(null);
    const numberFormRef = useRef<NumberWithSymbolFormRef | null>(null);
    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [formError, setFormError] = useState<string>('');

    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isEditingSplit = (iouType === CONST.IOU.TYPE.SPLIT || iouType === CONST.IOU.TYPE.SPLIT_EXPENSE) && isEditing;
    const isCreatingNewRequest = !backTo && !isEditing;
    const isTransactionDraft = shouldUseTransactionDraft(action, iouType);
    const currentUserAccountIDParam = currentUserPersonalDetails.accountID;
    const currentUserEmailParam = currentUserPersonalDetails.login ?? '';
    const delegateAccountID = useDelegateAccountID();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const isTrackIntentUser = isTrackOnboardingChoice(introSelected?.choice);

    const shouldUseDefaultExpensePolicy = shouldUseDefaultExpensePolicyUtil(
        iouType,
        defaultExpensePolicy,
        amountOwed,
        userBillingGracePeriodEnds,
        ownerBillingGracePeriodEnd,
        currentUserAccountIDParam,
    );
    const shouldAutoReportToDefaultWorkspace = shouldUseDefaultExpensePolicy && (!!defaultExpensePolicy?.autoReporting || !!personalPolicy?.autoReporting);
    const blockDistanceRequestIfNeeded = useBlockDistanceRequest({
        policyID: report?.policyID ?? (shouldAutoReportToDefaultWorkspace ? defaultExpensePolicy?.id : undefined),
        isManualDistanceRequest: true,
    });

    // to make sure the correct distance amount and unit will be shown we use distance unit
    // from defaultExpensePolicy or current report's policy instead of from transaction and
    // then we use transaction data (distanceUnit and quantity) for conversions
    const mileageRate = DistanceRequestUtils.getRate({
        transaction,
        policy: shouldUseDefaultExpensePolicy ? defaultExpensePolicy : policy,
        useTransactionDistanceUnit: isEditing,
        personalPolicyOutputCurrency: personalPolicy?.outputCurrency,
    });
    const unit = mileageRate.unit;
    const rate = mileageRate.rate ?? 0;
    const distanceInMeters = getDistanceInMeters(transaction, transaction?.comment?.customUnit?.distanceUnit ? transaction.comment.customUnit.distanceUnit : unit);
    const distance = typeof transaction?.comment?.customUnit?.quantity === 'number' ? roundToTwoDecimalPlaces(DistanceRequestUtils.convertDistanceUnit(distanceInMeters, unit)) : undefined;

    const committedDistance = distance?.toString() ?? '';
    // Mirrors the input so dirtiness compares the current value against the baseline instead of reading a ref
    const [typedDistance, setTypedDistance] = useState(committedDistance);

    const {suppressDiscardPrompt} = useDiscardChangesConfirmation({
        getHasUnsavedChanges: () => getStringFieldHasUnsavedChanges(typedDistance, committedDistance, isCreatingNewRequest),
        onCancel: () => {
            focusTimeoutRef.current = setTimeout(() => textInput.current?.focus(), CONST.ANIMATED_TRANSITION);
        },
    });

    let shouldSkipConfirmation = false;
    if (skipConfirmation && report?.reportID) {
        shouldSkipConfirmation = !(isArchived || isPolicyExpenseChatUtils(report));
    }

    let buttonText: string;
    if (shouldSkipConfirmation) {
        buttonText = translate('iou.createExpense');
    } else {
        buttonText = isCreatingNewRequest ? translate('common.next') : translate('common.save');
    }

    // Sync the imperative NumberWithSymbolForm child with the React-owned `distance`
    // whenever it or the selected tab changes. This is syncing with an external
    // (imperative) widget, which is a legitimate effect use case.
    useEffect(() => {
        // The transaction can hydrate after this screen mounts, so the mount-time mirror above can be
        // empty while the input already shows the committed distance. Re-seed it here or an untouched
        // screen reads as dirty and prompts on back.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTypedDistance(committedDistance);
        if (numberFormRef.current && numberFormRef.current?.getNumber() === committedDistance) {
            return;
        }
        numberFormRef.current?.updateNumber(committedDistance);
    }, [committedDistance, selectedTab]);

    useFocusEffect(() => {
        focusTimeoutRef.current = setTimeout(() => textInput.current?.focus(), CONST.ANIMATED_TRANSITION);
        return () => {
            if (!focusTimeoutRef.current) {
                return;
            }
            clearTimeout(focusTimeoutRef.current);
        };
    });

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    const policyTagList = useMoneyRequestPolicyTagsForReport({report, currentUserAccountID: currentUserAccountIDParam});

    const {participants, participantsPolicyTags} = useMoneyRequestParticipantsPolicyTags({
        dateFnsLocale,
        currentUserAccountID: currentUserAccountIDParam,
        report,
        policy,
        personalDetails,
        conciergeReportID,
        isArchived,
        reportAttributesDerived,
        reportDraft,
        translate,
    });

    const navigateToNextPage = (amount: string) => {
        const distanceAsFloat = roundToTwoDecimalPlaces(parseFloat(amount));

        if (action === CONST.IOU.ACTION.EDIT) {
            // In the split flow, when editing we use SPLIT_TRANSACTION_DRAFT to save draft value
            if (isEditingSplit && transaction) {
                setDraftSplitTransaction(
                    transaction.transactionID,
                    splitDraftTransaction,
                    {distance: distanceAsFloat},
                    getCurrencyDecimals,
                    getCurrencySymbol,
                    policy,
                    personalPolicy?.outputCurrency,
                );
                Navigation.goBack(backTo);
                return;
            }

            const transactionDistanceUnit = transaction?.comment?.customUnit?.distanceUnit;
            const isDistanceChanged = distance !== distanceAsFloat;
            const isDistanceUnitChanged = transactionDistanceUnit && transactionDistanceUnit !== unit;
            const shouldUpdateTransaction = isDistanceChanged || isDistanceUnitChanged;

            if (shouldUpdateTransaction) {
                updateMoneyRequestDistance({
                    transaction,
                    transactionThreadReport: report,
                    parentReport,
                    iouReportOwnerLogin,
                    distance: distanceAsFloat,
                    // Not required for manual distance request
                    transactionBackup: undefined,
                    policy,
                    distanceOriginalPolicy,
                    policyTagList: policyTags,
                    policyCategories,
                    currentUserAccountIDParam,
                    currentUserEmailParam,
                    isASAPSubmitBetaEnabled,
                    recentWaypoints,
                    delegateAccountID,
                    reportPolicyTags,
                    isTrackIntentUser,
                    personalPolicyOutputCurrency: personalPolicy?.outputCurrency,
                    getCurrencyDecimals,
                    getCurrencySymbol,
                });
            }
            Navigation.goBack(backTo);
            return;
        }

        setMoneyRequestDistance(transactionID, distanceAsFloat, isTransactionDraft, unit);

        const optimisticTransactionID = rand64();
        const optimisticChatReportID = selfDMReport?.reportID ?? generateReportID();

        handleMoneyRequestStepDistanceNavigation({
            getCurrencyDecimals,
            iouType,
            action,
            report,
            policy,
            transaction,
            reportID,
            transactionID,
            personalDetails,
            manualDistance: distanceAsFloat,
            currentUserLogin: currentUserEmailParam,
            currentUserAccountID: currentUserAccountIDParam,
            currentUserLocalCurrency: currentUserPersonalDetails.localCurrencyCode ?? CONST.CURRENCY.USD,
            backTo,
            backToReport,
            shouldSkipConfirmation,
            defaultExpensePolicy,
            isArchivedExpenseReport: isArchived,
            isAutoReporting: !!personalPolicy?.autoReporting,
            isASAPSubmitBetaEnabled,
            transactionViolations,
            lastSelectedDistanceRates,
            translate,
            quickAction,
            policyRecentlyUsedCurrencies,
            introSelected,
            isOffline,
            selfDMReport,
            policyForMovingExpenses,
            betas,
            recentWaypoints,
            unit,
            personalOutputCurrency: personalPolicy?.outputCurrency,
            isSelfTourViewed: !!isSelfTourViewed,
            amountOwed,
            userBillingGracePeriodEnds,
            ownerBillingGracePeriodEnd,
            conciergeChat,
            draftTransactionIDs,
            optimisticTransactionID,
            optimisticChatReportID,
            isTrackIntentUser,
            delegateAccountID,
            policyTagList,
            formatPhoneNumber,
            getCurrencySymbol,
            participants,
            participantsPolicyTags,
        });
    };

    const submitAndNavigateToNextPage = () => {
        if (blockDistanceRequestIfNeeded()) {
            return;
        }

        const value = numberFormRef.current?.getNumber() ?? '';

        if (!value.length || parseFloat(value) <= 0) {
            setFormError(translate('iou.error.invalidDistance'));
            return;
        }

        // Validation: Check that distance * rate doesn't exceed the backend's safe amount limit
        if (!DistanceRequestUtils.isDistanceAmountWithinLimit(parseFloat(value), rate)) {
            setFormError(translate('iou.error.distanceAmountTooLargeReduceDistance'));
            return;
        }

        suppressDiscardPrompt();
        navigateToNextPage(value);
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('common.distance')}
            onBackButtonPress={navigateBack}
            testID="DynamicIOURequestStepDistanceManual"
            shouldShowNotFoundPage={false}
            shouldShowWrapper={!isCreatingNewRequest}
            includeSafeAreaPaddingBottom
        >
            <NumberWithSymbolForm
                ref={textInput}
                numberFormRef={numberFormRef}
                value={distance?.toString()}
                shouldUseDynamicFontSize
                onInputChange={(newDistance) => {
                    setTypedDistance(newDistance);
                    if (!formError) {
                        return;
                    }
                    setFormError('');
                }}
                decimals={CONST.DISTANCE_DECIMAL_PLACES}
                symbol={unit}
                symbolPosition={CONST.TEXT_INPUT_SYMBOL_POSITION.SUFFIX}
                isSymbolPressable={false}
                symbolTextStyle={styles.textSupporting}
                style={styles.iouAmountTextInput}
                containerStyle={styles.iouAmountTextInputContainer}
                autoGrowExtraSpace={variables.w80}
                touchableInputWrapperStyle={styles.heightUndefined}
                errorText={formError}
                accessibilityLabel={`${translate('common.distance')} (${translate(`common.${unit}`)})`}
                footer={
                    <Button
                        variant={CONST.BUTTON_VARIANT.SUCCESS}
                        size={isExtraSmallScreenHeight ? CONST.BUTTON_SIZE.MEDIUM : CONST.BUTTON_SIZE.LARGE}
                        style={[styles.w100, canUseTouchScreen() ? styles.mt5 : styles.mt0]}
                        onPress={submitAndNavigateToNextPage}
                        testID="next-button"
                        sentryLabel={CONST.SENTRY_LABEL.IOU_REQUEST_STEP.DISTANCE_MANUAL_NEXT_BUTTON}
                    >
                        {/* Prevent bubbling on edit amount Page to prevent double page submission when two CTA are stacked. */}
                        <Button.KeyboardShortcut allowBubble={!isEditing} />
                        <Button.Text>{buttonText}</Button.Text>
                    </Button>
                }
            />
        </StepScreenWrapper>
    );
}

const DynamicIOURequestStepDistanceManualWithCurrentUserPersonalDetails = withCurrentUserPersonalDetails(DynamicIOURequestStepDistanceManual);

const DynamicIOURequestStepDistanceManualWithWritableReportOrNotFound = withWritableReportOrNotFound(DynamicIOURequestStepDistanceManualWithCurrentUserPersonalDetails, true);

const DynamicIOURequestStepDistanceManualWithFullTransactionOrNotFound = withFullTransactionOrNotFound(DynamicIOURequestStepDistanceManualWithWritableReportOrNotFound);

export default DynamicIOURequestStepDistanceManualWithFullTransactionOrNotFound;
