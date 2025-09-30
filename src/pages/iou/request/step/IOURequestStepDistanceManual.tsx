/* eslint-disable @typescript-eslint/no-unused-vars */
import {useFocusEffect} from '@react-navigation/native';
import reportsSelector from '@selectors/Attributes';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
import NumberWithSymbolForm from '@components/NumberWithSymbolForm';
import type {NumberWithSymbolFormRef} from '@components/NumberWithSymbolForm';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import useDefaultExpensePolicy from '@hooks/useDefaultExpensePolicy';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {
    createDistanceRequest,
    getMoneyRequestParticipantsFromReport,
    setCustomUnitRateID,
    setMoneyRequestDistance,
    setMoneyRequestMerchant,
    setMoneyRequestParticipantsFromReport,
    setMoneyRequestPendingFields,
    trackExpense,
    updateMoneyRequestDistance,
} from '@libs/actions/IOU';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {navigateToParticipantPage, shouldUseTransactionDraft} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {roundToTwoDecimalPlaces} from '@libs/NumberUtils';
import {getParticipantsOption, getReportOption} from '@libs/OptionsListUtils';
import {isPaidGroupPolicy} from '@libs/PolicyUtils';
import {getPolicyExpenseChat, isArchivedReport, isPolicyExpenseChat as isPolicyExpenseChatUtils} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import {getRateID} from '@libs/TransactionUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type Transaction from '@src/types/onyx/Transaction';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepDistanceManualProps = WithCurrentUserPersonalDetailsProps &
    WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_DISTANCE_MANUAL | typeof SCREENS.MONEY_REQUEST.DISTANCE_CREATE> & {
        /** The transaction object being modified in Onyx */
        transaction: OnyxEntry<Transaction>;
    };

function IOURequestStepDistanceManual({
    report,
    route: {
        params: {action, iouType, reportID, transactionID, backTo, backToReport},
    },
    transaction,
    currentUserPersonalDetails,
}: IOURequestStepDistanceManualProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isExtraSmallScreenHeight} = useResponsiveLayout();
    const textInput = useRef<BaseTextInputRef | null>(null);
    const numberFormRef = useRef<NumberWithSymbolFormRef | null>(null);
    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [formError, setFormError] = useState<string>('');

    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID}`, {canBeMissing: true});
    const [selectedTab, selectedTabResult] = useOnyx(`${ONYXKEYS.COLLECTION.SELECTED_TAB}${CONST.TAB.DISTANCE_REQUEST_TYPE}`, {canBeMissing: true});
    const isLoadingSelectedTab = isLoadingOnyxValue(selectedTabResult);
    const policy = usePolicy(report?.policyID);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});
    const defaultExpensePolicy = useDefaultExpensePolicy();
    const [skipConfirmation] = useOnyx(`${ONYXKEYS.COLLECTION.SKIP_CONFIRMATION}${transactionID}`, {canBeMissing: true});
    const [lastSelectedDistanceRates] = useOnyx(ONYXKEYS.NVP_LAST_SELECTED_DISTANCE_RATES, {canBeMissing: true});
    const [reportAttributesDerived] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {canBeMissing: true, selector: reportsSelector});

    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isCreatingNewRequest = !(backTo || isEditing);

    const isTransactionDraft = shouldUseTransactionDraft(action, iouType);

    const customUnitRateID = getRateID(transaction);
    const unit = DistanceRequestUtils.getRate({transaction, policy}).unit;
    const distance = transaction?.comment?.customUnit?.quantity ? roundToTwoDecimalPlaces(transaction.comment.customUnit.quantity) : undefined;

    useEffect(() => {
        if (numberFormRef.current && numberFormRef.current?.getNumber() === distance?.toString()) {
            return;
        }
        numberFormRef.current?.updateNumber(distance?.toString() ?? '');
    }, [distance]);

    const shouldSkipConfirmation: boolean = useMemo(() => {
        if (!skipConfirmation || !report?.reportID) {
            return false;
        }

        return !(isArchivedReport(reportNameValuePairs) || isPolicyExpenseChatUtils(report));
    }, [report, skipConfirmation, reportNameValuePairs]);

    useFocusEffect(
        useCallback(() => {
            focusTimeoutRef.current = setTimeout(() => textInput.current?.focus(), CONST.ANIMATED_TRANSITION);
            return () => {
                if (!focusTimeoutRef.current) {
                    return;
                }
                clearTimeout(focusTimeoutRef.current);
            };
        }, []),
    );

    const navigateBack = useCallback(() => {
        Navigation.goBack(backTo);
    }, [backTo]);

    const buttonText = useMemo(() => {
        if (shouldSkipConfirmation) {
            return translate('iou.createExpense');
        }

        return isCreatingNewRequest ? translate('common.next') : translate('common.save');
    }, [shouldSkipConfirmation, translate, isCreatingNewRequest]);

    const navigateToConfirmationPage = useCallback(() => {
        switch (iouType) {
            case CONST.IOU.TYPE.REQUEST:
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.SUBMIT, transactionID, reportID, backToReport));
                break;
            default:
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, iouType, transactionID, reportID, backToReport));
        }
    }, [iouType, transactionID, reportID, backToReport]);

    const navigateToNextPage = useCallback(
        (amount: string) => {
            const distanceAsFloat = roundToTwoDecimalPlaces(parseFloat(amount));
            setMoneyRequestDistance(transactionID, distanceAsFloat, isTransactionDraft);

            if (action === CONST.IOU.ACTION.EDIT) {
                if (distance !== distanceAsFloat) {
                    updateMoneyRequestDistance({
                        transactionID: transaction?.transactionID,
                        transactionThreadReportID: reportID,
                        distance: distanceAsFloat,
                        // Not required for manual distance request
                        transactionBackup: undefined,
                        policy,
                    });
                }
                Navigation.goBack(backTo);
                return;
            }

            if (backTo) {
                Navigation.goBack(backTo);
                return;
            }

            if (report?.reportID && !isArchivedReport(reportNameValuePairs) && iouType !== CONST.IOU.TYPE.CREATE) {
                const selectedParticipants = getMoneyRequestParticipantsFromReport(report);
                const participants = selectedParticipants.map((participant) => {
                    const participantAccountID = participant?.accountID ?? CONST.DEFAULT_NUMBER_ID;
                    return participantAccountID ? getParticipantsOption(participant, personalDetails) : getReportOption(participant, reportAttributesDerived);
                });
                if (shouldSkipConfirmation) {
                    setMoneyRequestPendingFields(transactionID, {waypoints: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD});
                    setMoneyRequestMerchant(transactionID, translate('iou.fieldPending'), false);
                    const participant = participants.at(0);
                    if (iouType === CONST.IOU.TYPE.TRACK && participant) {
                        trackExpense({
                            report,
                            isDraftPolicy: false,
                            participantParams: {
                                payeeEmail: currentUserPersonalDetails.login,
                                payeeAccountID: currentUserPersonalDetails.accountID,
                                participant,
                            },
                            policyParams: {
                                policy,
                            },
                            transactionParams: {
                                amount: 0,
                                distance: distanceAsFloat,
                                currency: transaction?.currency ?? 'USD',
                                created: transaction?.created ?? '',
                                merchant: translate('iou.fieldPending'),
                                receipt: {},
                                billable: false,
                                customUnitRateID,
                                attendees: transaction?.comment?.attendees,
                            },
                        });
                        return;
                    }

                    const isPolicyExpenseChat = !!participant?.isPolicyExpenseChat;

                    createDistanceRequest({
                        report,
                        participants,
                        currentUserLogin: currentUserPersonalDetails.login,
                        currentUserAccountID: currentUserPersonalDetails.accountID,
                        iouType,
                        existingTransaction: transaction,
                        transactionParams: {
                            amount: 0,
                            distance: distanceAsFloat,
                            comment: '',
                            created: transaction?.created ?? '',
                            currency: transaction?.currency ?? 'USD',
                            merchant: translate('iou.fieldPending'),
                            billable: !!policy?.defaultBillable,
                            customUnitRateID: DistanceRequestUtils.getCustomUnitRateID({reportID: report.reportID, isPolicyExpenseChat, policy, lastSelectedDistanceRates}),
                            splitShares: transaction?.splitShares,
                            attendees: transaction?.comment?.attendees,
                        },
                        backToReport,
                    });
                    return;
                }
                setMoneyRequestParticipantsFromReport(transactionID, report).then(() => {
                    navigateToConfirmationPage();
                });
                return;
            }

            // If there was no reportID, then that means the user started this flow from the global menu
            // and an optimistic reportID was generated. In that case, the next step is to select the participants for this expense.
            if (
                iouType === CONST.IOU.TYPE.CREATE &&
                isPaidGroupPolicy(defaultExpensePolicy) &&
                defaultExpensePolicy?.isPolicyExpenseChatEnabled &&
                !shouldRestrictUserBillableActions(defaultExpensePolicy.id)
            ) {
                const activePolicyExpenseChat = getPolicyExpenseChat(currentUserPersonalDetails.accountID, defaultExpensePolicy?.id);
                const rateID = DistanceRequestUtils.getCustomUnitRateID({
                    reportID: activePolicyExpenseChat?.reportID,
                    isPolicyExpenseChat: true,
                    policy: defaultExpensePolicy,
                    lastSelectedDistanceRates,
                });
                setCustomUnitRateID(transactionID, rateID);
                setMoneyRequestParticipantsFromReport(transactionID, activePolicyExpenseChat).then(() => {
                    Navigation.navigate(
                        ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(
                            CONST.IOU.ACTION.CREATE,
                            iouType === CONST.IOU.TYPE.CREATE ? CONST.IOU.TYPE.SUBMIT : iouType,
                            transactionID,
                            activePolicyExpenseChat?.reportID,
                        ),
                    );
                });
            } else {
                navigateToParticipantPage(iouType, transactionID, reportID);
            }
        },
        [
            transactionID,
            reportID,
            transaction,
            report,
            backTo,
            backToReport,
            iouType,
            currentUserPersonalDetails.login,
            currentUserPersonalDetails.accountID,
            reportNameValuePairs,
            isTransactionDraft,
            defaultExpensePolicy,
            shouldSkipConfirmation,
            personalDetails,
            reportAttributesDerived,
            policy,
            lastSelectedDistanceRates,
            customUnitRateID,
            translate,
            navigateToConfirmationPage,
            action,
            distance,
        ],
    );

    const submitAndNavigateToNextPage = useCallback(() => {
        const value = numberFormRef.current?.getNumber() ?? '';
        if (!value.length || parseFloat(value) < 0.01) {
            setFormError(translate('iou.error.invalidDistance'));
            return;
        }

        navigateToNextPage(value);
    }, [navigateToNextPage, translate]);

    useEffect(() => {
        if (isLoadingSelectedTab) {
            return;
        }
        setFormError('');
    }, [selectedTab, isLoadingSelectedTab]);

    return (
        <StepScreenWrapper
            headerTitle={translate('common.distance')}
            onBackButtonPress={navigateBack}
            testID={IOURequestStepDistanceManual.displayName}
            shouldShowNotFoundPage={false}
            shouldShowWrapper={!isCreatingNewRequest}
            includeSafeAreaPaddingBottom
        >
            <NumberWithSymbolForm
                ref={textInput}
                numberFormRef={numberFormRef}
                value={distance?.toString()}
                onInputChange={() => {
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
                errorText={formError}
                footer={
                    <Button
                        success
                        // Prevent bubbling on edit amount Page to prevent double page submission when two CTA are stacked.
                        allowBubble={!isEditing}
                        pressOnEnter
                        medium={isExtraSmallScreenHeight}
                        large={!isExtraSmallScreenHeight}
                        style={[styles.w100, canUseTouchScreen() ? styles.mt5 : styles.mt0]}
                        onPress={submitAndNavigateToNextPage}
                        text={buttonText}
                        testID="next-button"
                    />
                }
            />
        </StepScreenWrapper>
    );
}

IOURequestStepDistanceManual.displayName = 'IOURequestStepDistanceManual';

const IOURequestStepDistanceManualWithCurrentUserPersonalDetails = withCurrentUserPersonalDetails(IOURequestStepDistanceManual);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepDistanceManualWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepDistanceManualWithCurrentUserPersonalDetails, true);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepDistanceManualWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepDistanceManualWithWritableReportOrNotFound);

export default IOURequestStepDistanceManualWithFullTransactionOrNotFound;
