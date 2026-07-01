/**
 * Owns the post-capture-only Onyx reads (default policy, self-DM report,
 * billing grace periods) used by navigateGlobalCreate. Render-gated by a
 * one-tick useEffect so the subscriptions don't block ManualEntryToScanReady.
 *
 * The Provider's root element type stays the same across renders, so the
 * camera isn't torn down when subscriptions become ready. useNavigateGlobalCreate()
 * returns a stable callable.
 */
import React, {createContext, useCallback, useContext, useEffect, useRef, useState} from 'react';
import type {RefObject} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import useDefaultExpensePolicy from '@hooks/useDefaultExpensePolicy';
import useOnyx from '@hooks/useOnyx';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import useSelfDMReport from '@hooks/useSelfDMReport';
import {navigateToConfirmationPage, navigateToParticipantPage} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getPolicyExpenseChat, isSelfDM} from '@libs/ReportUtils';
import shouldUseDefaultExpensePolicy from '@libs/shouldUseDefaultExpensePolicy';
import {endSpan} from '@libs/telemetry/activeSpans';
import startScanProcessSpan from '@pages/iou/request/step/IOURequestStepScan/utils/startScanProcessSpan';
import {setMoneyRequestParticipants, setMoneyRequestParticipantsFromReport} from '@userActions/IOU/MoneyRequest';
import {setTransactionReport} from '@userActions/Transaction';
import CONST from '@src/CONST';
import type {IOUType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type Transaction from '@src/types/onyx/Transaction';

type NavigateGlobalCreateFn = (transactionIDs: string[], isMultiScanEnabled: boolean) => void;

type ProviderProps = WithCurrentUserPersonalDetailsProps & {
    iouType: IOUType;
    reportID: string;
    transactionID: string;
    transaction: OnyxEntry<Transaction>;
    backToReport: string | undefined;
    children: React.ReactNode;
};

type SubscriberProps = Omit<ProviderProps, 'children'> & {
    fnRef: RefObject<NavigateGlobalCreateFn>;
};

const NO_OP: NavigateGlobalCreateFn = () => {};
const NavigateGlobalCreateContext = createContext<NavigateGlobalCreateFn>(NO_OP);

function useNavigateGlobalCreate(): NavigateGlobalCreateFn {
    return useContext(NavigateGlobalCreateContext);
}

function NavigateGlobalCreateProvider({children, ...rest}: ProviderProps) {
    const fnRef = useRef<NavigateGlobalCreateFn>(NO_OP);
    const [isReady, setIsReady] = useState(false);

    // Stable dispatch — context value identity never changes, so consumers
    // don't re-render on Onyx ticks. Late-binds to fnRef.current at call time.
    const dispatch = useCallback((transactionIDs: string[], isMultiScanEnabled: boolean) => {
        fnRef.current(transactionIDs, isMultiScanEnabled);
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional one-tick defer to keep heavy Onyx subscriptions off the camera-mount critical path
        setIsReady(true);
    }, []);

    return (
        <NavigateGlobalCreateContext.Provider value={dispatch}>
            {isReady && (
                <NavigateGlobalCreateSubscriber
                    fnRef={fnRef}
                    {...rest}
                />
            )}
            {children}
        </NavigateGlobalCreateContext.Provider>
    );
}

function NavigateGlobalCreateSubscriber({fnRef, iouType, reportID, transactionID, transaction, backToReport, currentUserPersonalDetails}: SubscriberProps) {
    const defaultExpensePolicy = useDefaultExpensePolicy();
    const personalPolicy = usePersonalPolicy();
    const selfDMReport = useSelfDMReport();
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);

    const navigateGlobalCreate: NavigateGlobalCreateFn = (transactionIDs, isMultiScanEnabled) => {
        startScanProcessSpan(isMultiScanEnabled);
        if (shouldUseDefaultExpensePolicy(iouType, defaultExpensePolicy, amountOwed, userBillingGracePeriodEnds, ownerBillingGracePeriodEnd, currentUserPersonalDetails.accountID)) {
            const shouldAutoReport = !!defaultExpensePolicy?.autoReporting || !!personalPolicy?.autoReporting;
            const targetReport = shouldAutoReport ? getPolicyExpenseChat(currentUserPersonalDetails.accountID, defaultExpensePolicy?.id) : selfDMReport;
            const transactionReportID = isSelfDM(targetReport) ? CONST.REPORT.UNREPORTED_REPORT_ID : targetReport?.reportID;
            const iouTypeTrackOrSubmit = transactionReportID === CONST.REPORT.UNREPORTED_REPORT_ID ? CONST.IOU.TYPE.TRACK : CONST.IOU.TYPE.SUBMIT;

            // If the user previously selected different participants in confirmation, preserve that choice
            if (transaction?.participants && transaction.participants.at(0)?.reportID !== targetReport?.reportID) {
                const isTrackExpense = transaction.participants.at(0)?.reportID === selfDMReport?.reportID;

                const setParticipantsPromises = transactionIDs.map((tid) => setMoneyRequestParticipants(tid, transaction.participants));
                Promise.all(setParticipantsPromises).then(() => {
                    if (isTrackExpense) {
                        endSpan(CONST.TELEMETRY.SPAN_SCAN_PROCESS_AND_NAVIGATE);
                        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.TRACK, transactionID, selfDMReport?.reportID));
                    } else {
                        navigateToConfirmationPage(iouType, transactionID, reportID, backToReport, iouType === CONST.IOU.TYPE.CREATE, transaction.reportID);
                    }
                });
                return;
            }

            const setParticipantsPromises = transactionIDs.map((tid) => {
                setTransactionReport(tid, {reportID: transactionReportID}, true);
                return setMoneyRequestParticipantsFromReport(tid, targetReport, currentUserPersonalDetails.accountID);
            });
            Promise.all(setParticipantsPromises).then(() => {
                endSpan(CONST.TELEMETRY.SPAN_SCAN_PROCESS_AND_NAVIGATE);
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, iouTypeTrackOrSubmit, transactionID, targetReport?.reportID));
            });
        } else {
            endSpan(CONST.TELEMETRY.SPAN_SCAN_PROCESS_AND_NAVIGATE);
            navigateToParticipantPage(iouType, transactionID, reportID);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line no-param-reassign -- publish navigate fn through ref so the context value identity stays stable across Onyx ticks
        fnRef.current = navigateGlobalCreate;
    });

    return null;
}

NavigateGlobalCreateProvider.displayName = 'NavigateGlobalCreateProvider';

export {NavigateGlobalCreateProvider, useNavigateGlobalCreate};
