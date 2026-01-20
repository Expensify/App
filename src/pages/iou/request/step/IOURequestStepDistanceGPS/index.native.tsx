import reportsSelector from '@selectors/Attributes';
import React, {useState} from 'react';
import {View} from 'react-native';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import useDefaultExpensePolicy from '@hooks/useDefaultExpensePolicy';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import usePolicy from '@hooks/usePolicy';
import useShowNotFoundPageInIOUStep from '@hooks/useShowNotFoundPageInIOUStep';
import useThemeStyles from '@hooks/useThemeStyles';
import {
    createDistanceRequest,
    getGPSWaypoints,
    getMoneyRequestParticipantsFromReport,
    setCustomUnitRateID,
    setGPSTransactionDraftData,
    setMoneyRequestMerchant,
    setMoneyRequestParticipantsFromReport,
    setMoneyRequestPendingFields,
    trackExpense,
} from '@libs/actions/IOU';
import {setTransactionReport} from '@libs/actions/Transaction';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {navigateToParticipantPage} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {roundToTwoDecimalPlaces} from '@libs/NumberUtils';
import {getParticipantsOption, getReportOption} from '@libs/OptionsListUtils';
import {isPaidGroupPolicy} from '@libs/PolicyUtils';
import {getPolicyExpenseChat, isArchivedReport, isPolicyExpenseChat as isPolicyExpenseChatUtils} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import StepScreenWrapper from '@pages/iou/request/step/StepScreenWrapper';
import withFullTransactionOrNotFound from '@pages/iou/request/step/withFullTransactionOrNotFound';
import withWritableReportOrNotFound from '@pages/iou/request/step/withWritableReportOrNotFound';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import Disclaimer from './Disclaimer';
import DistanceCounter from './DistanceCounter';
import GPSButtons from './GPSButtons';
import type IOURequestStepDistanceGPSProps from './types';
import Waypoints from './Waypoints';

function IOURequestStepDistanceGPS({
    report,
    route: {
        params: {action, iouType, reportID, transactionID, reportActionID, backToReport},
    },
    transaction,
    currentUserPersonalDetails,
}: IOURequestStepDistanceGPSProps) {
    const styles = useThemeStyles();

    const {translate} = useLocalize();
    const {isBetaEnabled} = usePermissions();

    const [lastSelectedDistanceRates] = useOnyx(ONYXKEYS.NVP_LAST_SELECTED_DISTANCE_RATES, {canBeMissing: true});
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID}`, {canBeMissing: true});
    const [gpsDraftDetails] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS, {canBeMissing: true});
    const [skipConfirmation] = useOnyx(`${ONYXKEYS.COLLECTION.SKIP_CONFIRMATION}${transactionID}`, {canBeMissing: true});
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});
    const [reportAttributesDerived] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {canBeMissing: true, selector: reportsSelector});
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE, {canBeMissing: true});
    const [policyRecentlyUsedCurrencies] = useOnyx(ONYXKEYS.RECENTLY_USED_CURRENCIES, {canBeMissing: true});
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});

    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isCreatingNewRequest = !isEditing;
    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage = useShowNotFoundPageInIOUStep(action, iouType, reportActionID, report, transaction);
    const defaultExpensePolicy = useDefaultExpensePolicy();
    const personalPolicy = usePersonalPolicy();
    const policy = usePolicy(report?.policyID);

    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const currentUserAccountIDParam = currentUserPersonalDetails.accountID;
    const currentUserEmailParam = currentUserPersonalDetails.login ?? '';

    const shouldUseDefaultExpensePolicy =
        iouType === CONST.IOU.TYPE.CREATE &&
        isPaidGroupPolicy(defaultExpensePolicy) &&
        defaultExpensePolicy?.isPolicyExpenseChatEnabled &&
        !shouldRestrictUserBillableActions(defaultExpensePolicy.id);

    const unit = DistanceRequestUtils.getRate({transaction, policy: shouldUseDefaultExpensePolicy ? defaultExpensePolicy : policy}).unit;

    const shouldSkipConfirmation: boolean = !skipConfirmation || !report?.reportID ? false : !(isArchivedReport(reportNameValuePairs) || isPolicyExpenseChatUtils(report));

    const navigateToConfirmationPage = () => {
        switch (iouType) {
            case CONST.IOU.TYPE.REQUEST:
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.SUBMIT, transactionID, reportID, backToReport));
                break;
            case CONST.IOU.TYPE.SEND:
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.PAY, transactionID, reportID));
                break;
            default:
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, iouType, transactionID, reportID, backToReport));
        }
    };

    const navigateToNextStep = () => {
        const gpsCoordinates = gpsDraftDetails?.gpsPoints ? JSON.stringify(gpsDraftDetails.gpsPoints.map((val) => ({lng: val.long, lat: val.lat}))) : undefined;
        const distanceInMeters = gpsDraftDetails?.distanceInMeters ?? 0;
        const convertedDistance = DistanceRequestUtils.convertDistanceUnit(distanceInMeters, unit);
        const distance = roundToTwoDecimalPlaces(convertedDistance);

        setGPSTransactionDraftData(transactionID, gpsDraftDetails, distance);

        // If a reportID exists in the report object, use it to set participants and navigate to confirmation
        if (report?.reportID && !isArchivedReport(reportNameValuePairs) && iouType !== CONST.IOU.TYPE.CREATE) {
            const selectedParticipants = getMoneyRequestParticipantsFromReport(report, currentUserPersonalDetails.accountID);
            const participants = selectedParticipants.map((participant) => {
                const participantAccountID = participant?.accountID ?? CONST.DEFAULT_NUMBER_ID;
                return participantAccountID
                    ? getParticipantsOption(participant, personalDetails)
                    : getReportOption(participant, reportNameValuePairs?.private_isArchived, policy, reportAttributesDerived);
            });

            if (shouldSkipConfirmation) {
                setMoneyRequestPendingFields(transactionID, {waypoints: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD});
                setMoneyRequestMerchant(transactionID, translate('iou.fieldPending'), false);

                const participant = participants.at(0);
                const isPolicyExpenseChat = !!participant?.isPolicyExpenseChat;
                const customUnitRateID = DistanceRequestUtils.getCustomUnitRateID({reportID: report.reportID, isPolicyExpenseChat, policy, lastSelectedDistanceRates});

                const validWaypoints = getGPSWaypoints(gpsDraftDetails);

                if (iouType === CONST.IOU.TYPE.TRACK && participant) {
                    trackExpense({
                        report,
                        isDraftPolicy: false,
                        participantParams: {
                            payeeEmail: currentUserEmailParam,
                            payeeAccountID: currentUserAccountIDParam,
                            participant,
                        },
                        policyParams: {
                            policy,
                        },
                        transactionParams: {
                            amount: 0,
                            currency: transaction?.currency ?? 'USD',
                            created: transaction?.created ?? '',
                            merchant: translate('iou.fieldPending'),
                            receipt: {},
                            billable: false,
                            customUnitRateID,
                            attendees: transaction?.comment?.attendees,
                            distance,
                            validWaypoints,
                            gpsCoordinates,
                        },
                        isASAPSubmitBetaEnabled,
                        currentUserAccountIDParam,
                        currentUserEmailParam,
                        introSelected,
                        activePolicyID,
                        quickAction,
                    });

                    return;
                }

                createDistanceRequest({
                    report,
                    participants,
                    currentUserLogin: currentUserEmailParam,
                    currentUserAccountID: currentUserAccountIDParam,
                    iouType,
                    existingTransaction: transaction,
                    transactionParams: {
                        amount: 0,
                        comment: '',
                        created: transaction?.created ?? '',
                        currency: transaction?.currency ?? 'USD',
                        merchant: translate('iou.fieldPending'),
                        billable: !!policy?.defaultBillable,
                        reimbursable: !!policy?.defaultReimbursable,
                        customUnitRateID,
                        splitShares: transaction?.splitShares,
                        attendees: transaction?.comment?.attendees,
                        distance,
                        validWaypoints,
                        gpsCoordinates,
                    },
                    backToReport,
                    isASAPSubmitBetaEnabled,
                    transactionViolations,
                    quickAction,
                    policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
                });

                return;
            }

            setMoneyRequestParticipantsFromReport(transactionID, report, currentUserAccountIDParam).then(() => {
                navigateToConfirmationPage();
            });

            return;
        }

        // If there was no reportID, then that means the user started this flow from the global menu
        // and an optimistic reportID was generated. In that case, the next step is to select the participants for this expense.
        if (shouldUseDefaultExpensePolicy) {
            const activePolicyExpenseChat = getPolicyExpenseChat(currentUserPersonalDetails.accountID, defaultExpensePolicy?.id);
            const shouldAutoReport = !!defaultExpensePolicy?.autoReporting || !!personalPolicy?.autoReporting;
            const transactionReportID = shouldAutoReport ? activePolicyExpenseChat?.reportID : CONST.REPORT.UNREPORTED_REPORT_ID;
            const rateID = DistanceRequestUtils.getCustomUnitRateID({
                reportID: transactionReportID,
                isPolicyExpenseChat: true,
                policy: defaultExpensePolicy,
                lastSelectedDistanceRates,
            });

            setTransactionReport(transactionID, {reportID: transactionReportID}, true);
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
    };

    const [shouldShowStartError, setShouldShowStartError] = useState(false);
    const [shouldShowPermissionsError, setShouldShowPermissionsError] = useState(false);
    const getError = (): Errors => {
        if (shouldShowStartError) {
            return {startError: translate('gps.error.failedToStart')};
        }
        if (shouldShowPermissionsError) {
            return {permissionsError: translate('gps.error.failedToGetPermissions')};
        }
        return {};
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('common.distance')}
            onBackButtonPress={() => Navigation.goBack()}
            testID="IOURequestStepDistanceGPS"
            shouldShowNotFoundPage={shouldShowNotFoundPage}
            shouldShowWrapper={!isCreatingNewRequest}
        >
            <DistanceCounter
                report={report}
                transaction={transaction}
                iouType={iouType}
            />
            <View style={[styles.w100, styles.pAbsolute, styles.b0, styles.r0, styles.l0]}>
                <Waypoints />
                <Disclaimer />
                <DotIndicatorMessage
                    style={[styles.ph5, styles.pb3]}
                    messages={getError()}
                    type="error"
                />
                <GPSButtons
                    navigateToNextStep={navigateToNextStep}
                    setShouldShowStartError={setShouldShowStartError}
                    setShouldShowPermissionsError={setShouldShowPermissionsError}
                />
            </View>
        </StepScreenWrapper>
    );
}

const IOURequestStepDistanceGPSWithCurrentUserPersonalDetails = withCurrentUserPersonalDetails(IOURequestStepDistanceGPS);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepDistanceGPSWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepDistanceGPSWithCurrentUserPersonalDetails, true);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepDistanceGPSWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepDistanceGPSWithWritableReportOrNotFound);

export default IOURequestStepDistanceGPSWithFullTransactionOrNotFound;
