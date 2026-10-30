import ActivityIndicator from '@components/ActivityIndicator';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDefaultExpensePolicy from '@hooks/useDefaultExpensePolicy';
import useOnyx from '@hooks/useOnyx';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import useThemeStyles from '@hooks/useThemeStyles';

import {getInitialPerDiemTargetReport} from '@libs/IOUUtils';
import {getPerDiemCustomUnit, getPolicyByCustomUnitID} from '@libs/PolicyUtils';
import {findSelfDMReportID, getPolicyExpenseChat} from '@libs/ReportUtils';
import {isPerDiemRequest} from '@libs/TransactionUtils';

import {getIOURequestPolicyID, setCustomUnitID, setMoneyRequestCategory, setMoneyRequestParticipantsFromReport} from '@userActions/IOU/MoneyRequest';
import {setTransactionReport} from '@userActions/Transaction';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import React, {useEffect} from 'react';
import {View} from 'react-native';

import type {WithFullTransactionOrNotFoundProps} from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';

import {IOURequestStepConfirmationContentWithWritableReportOrNotFound as IOURequestStepConfirmationContent} from './IOURequestStepConfirmation';
import PerDiemRatesGate from './PerDiemRatesGate';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepPerDiemProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.CREATE> &
    WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.CREATE> & {
        /** The only workspace with per diem enabled, set when the expense is started from global create and no workspace selector is shown */
        explicitPolicyID?: string;
    };

/**
 * The per diem tab of the create page when the workspace is already known: the expense form itself, with the
 * destination, time and subrate fields inline. Before the form shows, it points the draft at the workspace whose
 * per diem rates it uses, which the destination step used to do once a destination was picked.
 */
function IOURequestStepPerDiem({report, route, navigation, transaction, explicitPolicyID}: IOURequestStepPerDiemProps) {
    const {
        params: {action, iouType, transactionID, reportID, backToReport},
    } = route;
    const styles = useThemeStyles();
    const {getCurrencyDecimals} = useCurrencyListActions();
    const {accountID} = useCurrentUserPersonalDetails();
    const defaultExpensePolicy = useDefaultExpensePolicy();
    const personalPolicy = usePersonalPolicy();
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [selfDMReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${findSelfDMReportID()}`);
    const reportPolicyID = getIOURequestPolicyID(transaction, report);
    const policyID = explicitPolicyID ?? (reportPolicyID === CONST.POLICY.ID_FAKE ? getPolicyByCustomUnitID(transaction, allPolicies)?.id : reportPolicyID);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const perDiemUnit = getPerDiemCustomUnit(policy);

    // A draft started from global create carries no custom unit yet, and one started from a chat whose rates had not
    // loaded carries the placeholder, so either one still has to be pointed at the workspace.
    const draftCustomUnitID = transaction?.comment?.customUnit?.customUnitID;
    const isDraftReady = isPerDiemRequest(transaction) && !!draftCustomUnitID && draftCustomUnitID !== CONST.CUSTOM_UNITS.FAKE_P2P_ID;

    useEffect(() => {
        // Wait for the tab switch to rebuild the draft as a per diem request. Writing to the previous draft would be
        // clobbered by that rebuild, which also resets the start and end dates.
        if (!isPerDiemRequest(transaction) || !perDiemUnit || isDraftReady) {
            return;
        }
        const isFromGlobalCreate = transaction?.isFromGlobalCreate ?? false;
        const sourceReport = explicitPolicyID && isFromGlobalCreate ? getPolicyExpenseChat(accountID, explicitPolicyID) : report;
        const {targetReport, targetIouType, transactionReportID} = getInitialPerDiemTargetReport(
            sourceReport,
            selfDMReport,
            iouType,
            defaultExpensePolicy,
            personalPolicy,
            isFromGlobalCreate,
        );
        setTransactionReport(transactionID, {reportID: transactionReportID}, true);
        setMoneyRequestParticipantsFromReport(transactionID, targetReport, accountID, targetIouType !== CONST.IOU.TYPE.TRACK);
        setCustomUnitID(transactionID, perDiemUnit.customUnitID);
        setMoneyRequestCategory(transactionID, perDiemUnit.defaultCategory ?? '', undefined, getCurrencyDecimals);
        if (targetIouType !== iouType) {
            navigation.setParams({iouType: targetIouType});
        }
        // Runs once per draft: the writes above make it ready, which ends the effect on its next run.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transaction?.iouRequestType, perDiemUnit?.customUnitID, isDraftReady]);

    return (
        <FullPageNotFoundView shouldShow={isEmptyObject(policy)}>
            <PerDiemRatesGate
                policyID={policy?.id}
                backToRoute={ROUTES.MONEY_REQUEST_CREATE_TAB_PER_DIEM.getRoute(action, iouType, transactionID, reportID, backToReport)}
            >
                {isDraftReady ? (
                    <IOURequestStepConfirmationContent
                        route={route}
                        navigation={navigation}
                        shouldHideHeader
                    />
                ) : (
                    // The header and tab bar stay above this loader, so per UI-1 it is an ActivityIndicator.
                    <View style={[styles.flex1, styles.fullScreenLoading]}>
                        <ActivityIndicator size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE} />
                    </View>
                )}
            </PerDiemRatesGate>
        </FullPageNotFoundView>
    );
}

export default withWritableReportOrNotFound(withFullTransactionOrNotFound(IOURequestStepPerDiem));
