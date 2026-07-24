import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDefaultExpensePolicy from '@hooks/useDefaultExpensePolicy';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePersonalPolicy from '@hooks/usePersonalPolicy';

import {fetchPerDiemRates} from '@libs/actions/Policy/PerDiem';
import {getInitialPerDiemTargetReport} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getActivePoliciesWithExpenseChatAndPerDiemEnabled, getPerDiemCustomUnit} from '@libs/PolicyUtils';
import {findSelfDMReportID, getPolicyExpenseChat} from '@libs/ReportUtils';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';

import {setCustomUnitID, setMoneyRequestCategory, setMoneyRequestParticipants, setMoneyRequestParticipantsFromReport} from '@userActions/IOU/MoneyRequest';
import {setTransactionReport} from '@userActions/Transaction';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React, {useEffect, useState} from 'react';

import type {WithFullTransactionOrNotFoundProps} from './withFullTransactionOrNotFound';

import BaseRequestStepWorkspace from './BaseRequestStepWorkspace';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';

type IOURequestStepPerDiemWorkspaceProps = WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.CREATE>;

function IOURequestStepPerDiemWorkspace({route, navigation, transaction}: IOURequestStepPerDiemWorkspaceProps) {
    const {
        params: {action, iouType, transactionID},
    } = route;
    const {accountID} = useCurrentUserPersonalDetails();
    const [selfDMReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${findSelfDMReportID()}`);
    const defaultExpensePolicy = useDefaultExpensePolicy();
    const personalPolicy = usePersonalPolicy();
    const {isOffline} = useNetwork();
    const [pendingPolicyID, setPendingPolicyID] = useState<string>();
    const [pendingPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${pendingPolicyID}`);

    const selectWorkspace = (policy: OnyxEntry<Policy>) => {
        const {targetReport, targetIouType, transactionReportID} = getInitialPerDiemTargetReport(
            getPolicyExpenseChat(accountID, policy?.id),
            selfDMReport,
            iouType,
            defaultExpensePolicy,
            personalPolicy,
            transaction?.isFromGlobalCreate ?? false,
        );

        if (!targetReport) {
            return;
        }

        const perDiemUnit = getPerDiemCustomUnit(policy);
        if (!perDiemUnit && policy?.id) {
            fetchPerDiemRates(policy.id);
        }

        const canDestinationResolvePolicy = !!perDiemUnit || (!!targetReport.policyID && targetReport.policyID !== CONST.POLICY.ID_FAKE);
        if (!canDestinationResolvePolicy) {
            setPendingPolicyID(policy?.id);
            return;
        }
        setPendingPolicyID(undefined);

        setTransactionReport(transactionID, {reportID: transactionReportID}, true);
        if (targetIouType === CONST.IOU.TYPE.TRACK) {
            setMoneyRequestParticipantsFromReport(transactionID, targetReport, accountID, false);
        } else {
            setMoneyRequestParticipants(transactionID, [
                {
                    selected: true,
                    accountID: 0,
                    isPolicyExpenseChat: true,
                    reportID: targetReport.reportID,
                    policyID: policy?.id,
                },
            ]);
        }
        setCustomUnitID(transactionID, perDiemUnit?.customUnitID ?? CONST.CUSTOM_UNITS.FAKE_P2P_ID);
        setMoneyRequestCategory(transactionID, perDiemUnit?.defaultCategory ?? '', undefined);
        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_DESTINATION.getRoute(action, targetIouType, transactionID, targetReport.reportID));
    };

    useEffect(() => {
        if (!pendingPolicyID || !getPerDiemCustomUnit(pendingPolicy)) {
            return;
        }
        const frame = requestAnimationFrame(() => selectWorkspace(pendingPolicy));
        return () => cancelAnimationFrame(frame);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pendingPolicy, pendingPolicyID]);

    if (pendingPolicyID) {
        if (isOffline) {
            return <FullPageOfflineBlockingView>{null}</FullPageOfflineBlockingView>;
        }
        const reasonAttributes: SkeletonSpanReasonAttributes = {context: 'IOURequestStepPerDiemWorkspace', pendingPolicyID};
        return <FullScreenLoadingIndicator reasonAttributes={reasonAttributes} />;
    }

    return (
        <BaseRequestStepWorkspace
            route={route}
            navigation={navigation}
            getPolicies={getActivePoliciesWithExpenseChatAndPerDiemEnabled}
            onSelectWorkspace={selectWorkspace}
        />
    );
}

export default withFullTransactionOrNotFound(IOURequestStepPerDiemWorkspace);
