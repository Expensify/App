import type {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import LocationPermissionModal from '@components/LocationPermissionModal';
import MoneyRequestConfirmationList from '@components/MoneyRequestConfirmationList';
import ScreenWrapper from '@components/ScreenWrapper';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import * as FileUtils from '@libs/fileDownload/FileUtils';
import getCurrentPosition from '@libs/getCurrentPosition';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import type {ShareNavigatorParamList} from '@libs/Navigation/types';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Participant} from '@src/types/onyx/IOU';
import type {Receipt} from '@src/types/onyx/Transaction';

type ShareDetailsPageProps = StackScreenProps<ShareNavigatorParamList, typeof SCREENS.SHARE.SUBMIT_DETAILS>;
function SubmitDetailsPage({
    route: {
        params: {reportID},
    },
}: ShareDetailsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [tempShareFiles] = useOnyx(`${ONYXKEYS.COLLECTION.TEMP_SHARE_FILES}`);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`);
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${IOU.getIOURequestPolicyID(transaction, report)}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${IOU.getIOURequestPolicyID(transaction, report)}`);
    const [personalDetails] = useOnyx(`${ONYXKEYS.PERSONAL_DETAILS_LIST}`);
    const [lastLocationPermissionPrompt] = useOnyx(ONYXKEYS.NVP_LAST_LOCATION_PERMISSION_PROMPT);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [startLocationPermissionFlow, setStartLocationPermissionFlow] = useState(false);

    useEffect(() => {
        IOU.initMoneyRequest(reportID, policy, false, CONST.IOU.REQUEST_TYPE.SCAN, CONST.IOU.REQUEST_TYPE.SCAN);
    }, [reportID, policy]);

    const currentAttachment = useMemo(() => {
        return Object.values(tempShareFiles ?? {})
            .sort((a, b) => Number(b?.processedAt) - Number(a?.processedAt))
            .at(0);
    }, [tempShareFiles]);
    const selectedParticipants = IOU.setMoneyRequestParticipantsFromReport(transaction?.transactionID ?? '-1', report);
    const participants = selectedParticipants.map((participant) => {
        const participantAccountID = participant?.accountID ?? -1;
        return participantAccountID ? OptionsListUtils.getParticipantsOption(participant, personalDetails) : OptionsListUtils.getReportOption(participant);
    });

    const receiptPath = `file://${currentAttachment?.content}`;
    const trimmedComment = transaction?.comment?.comment?.trim() ?? '';
    const transactionAmount = transaction?.amount ?? 0;
    const transactionTaxAmount = transaction?.taxAmount ?? 0;
    const defaultTaxCode = TransactionUtils.getDefaultTaxCode(policy, transaction);
    const transactionTaxCode = (transaction?.taxCode ? transaction?.taxCode : defaultTaxCode) ?? '';

    const finishRequestAndNavigate = (participant: Participant, receipt: Receipt, gpsPoint?: IOU.GpsPoint) => {
        if (!transaction) {
            return;
        }

        IOU.requestMoney(
            report,
            transactionAmount,
            transaction.attendees,
            transaction.currency,
            transaction.created,
            transaction.merchant ?? '',
            currentUserPersonalDetails.login,
            currentUserPersonalDetails.accountID,
            participant,
            trimmedComment,
            receipt,
            transaction.category,
            transaction.tag,
            transactionTaxCode,
            transactionTaxAmount,
            transaction.billable,
            policy,
            policyTags,
            policyCategories,
            gpsPoint,
            CONST.IOU.TYPE.CREATE,
            transaction.actionableWhisperReportActionID,
            transaction.linkedTrackedExpenseReportAction,
            transaction.linkedTrackedExpenseReportID,
        );
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(reportID), CONST.NAVIGATION.TYPE.UP);
    };

    const onSuccess = (file: File, locationPermissionGranted?: boolean) => {
        const participant = selectedParticipants.at(0);
        if (!participant) {
            return;
        }

        const receipt: Receipt = file;
        receipt.state = file && CONST.IOU.RECEIPT_STATE.SCANREADY;
        if ((transaction?.amount === undefined || transaction?.amount === 0) && locationPermissionGranted) {
            getCurrentPosition(
                (successData) => {
                    finishRequestAndNavigate(participant, receipt, {
                        lat: successData.coords.latitude,
                        long: successData.coords.longitude,
                    });
                },
                (errorData) => {
                    Log.info('[IOURequestStepConfirmation] getCurrentPosition failed', false, errorData);
                    // When there is an error, the money can still be requested, it just won't include the GPS coordinates
                    finishRequestAndNavigate(participant, receipt);
                },
                {
                    maximumAge: CONST.GPS.MAX_AGE,
                    timeout: CONST.GPS.TIMEOUT,
                },
            );
        }
    };

    const onConfirm = (gpsRequired?: boolean) => {
        // console.log('lastLocationPermissionPrompt', lastLocationPermissionPrompt);
        // console.log('DateUtils.isValidDateString(lastLocationPermissionPrompt ?? "")', DateUtils.isValidDateString(lastLocationPermissionPrompt ?? ''));
        // console.log('DateUtils.getDifferenceInDaysFromNow(new Date(lastLocationPermissionPrompt ?? ""))', DateUtils.getDifferenceInDaysFromNow(new Date(lastLocationPermissionPrompt ?? '')));
        const shouldStartLocationPermissionFlow =
            gpsRequired &&
            (!lastLocationPermissionPrompt ||
                (DateUtils.isValidDateString(lastLocationPermissionPrompt ?? '') &&
                    DateUtils.getDifferenceInDaysFromNow(new Date(lastLocationPermissionPrompt ?? '')) > CONST.IOU.LOCATION_PERMISSION_PROMPT_THRESHOLD_DAYS));

        if (shouldStartLocationPermissionFlow) {
            // console.log('shouldStartLocationPermissionFlow', shouldStartLocationPermissionFlow);
            setStartLocationPermissionFlow(true);
            return;
        }

        FileUtils.readFileAsync(
            receiptPath,
            FileUtils.getFileName(currentAttachment?.content ?? 'image'),
            (file) => onSuccess(file, shouldStartLocationPermissionFlow),
            () => {},
            currentAttachment?.mimeType ?? 'image/jpeg',
        );
    };

    return (
        <ScreenWrapper testID={SubmitDetailsPage.displayName}>
            <FullPageNotFoundView shouldShow={!reportID}>
                <HeaderWithBackButton
                    title={translate('common.details')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <LocationPermissionModal
                    startPermissionFlow={startLocationPermissionFlow}
                    resetPermissionFlow={() => setStartLocationPermissionFlow(false)}
                    onGrant={onConfirm}
                    onDeny={() => {
                        IOU.updateLastLocationPermissionPrompt();
                        setStartLocationPermissionFlow(false);
                        onConfirm(false);
                    }}
                />
                <View style={[styles.containerWithSpaceBetween, styles.pointerEventsBoxNone]}>
                    <MoneyRequestConfirmationList
                        selectedParticipants={participants}
                        iouAmount={0}
                        shouldDisplayReceipt
                        iouComment={trimmedComment}
                        isConfirmed={false}
                        reportID={reportID}
                        shouldShowSmartScanFields={false}
                        receiptPath={receiptPath}
                        receiptFilename={FileUtils.getFileName(currentAttachment?.content ?? 'test')}
                        transaction={transaction}
                        onConfirm={() => onConfirm(true)}
                    />
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

SubmitDetailsPage.displayName = 'SubmitDetailsPage';

export default SubmitDetailsPage;
