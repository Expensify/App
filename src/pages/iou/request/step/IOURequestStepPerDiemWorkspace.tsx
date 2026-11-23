import ActivityIndicator from '@components/ActivityIndicator';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import SelectionList from '@components/SelectionList';
import UserListItem from '@components/SelectionList/ListItem/UserListItem';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDefaultExpensePolicy from '@hooks/useDefaultExpensePolicy';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import usePrevious from '@hooks/usePrevious';
import useRequestStepWorkspaceList from '@hooks/useRequestStepWorkspaceList';
import useThemeStyles from '@hooks/useThemeStyles';

import {fetchPerDiemRates} from '@libs/actions/Policy/PerDiem';
import {getInitialPerDiemTargetReport} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getActivePoliciesWithExpenseChatAndPerDiemEnabled, getPerDiemCustomUnit} from '@libs/PolicyUtils';
import {findSelfDMReportID, getPolicyExpenseChat} from '@libs/ReportUtils';

import {setCustomUnitID, setMoneyRequestCategory, setMoneyRequestParticipants, setMoneyRequestParticipantsFromReport} from '@userActions/IOU/MoneyRequest';
import {setTransactionReport} from '@userActions/Transaction';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

import type {WithFullTransactionOrNotFoundProps} from './withFullTransactionOrNotFound';

import RequestStepWorkspaceListHeader from './RequestStepWorkspaceListHeader';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';

type IOURequestStepPerDiemWorkspaceProps = WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.CREATE>;

function IOURequestStepPerDiemWorkspace({route, transaction}: IOURequestStepPerDiemWorkspaceProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
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
    const [isLoadingPerDiemRates] = useOnyx(ONYXKEYS.RAM_ONLY_IS_LOADING_PER_DIEM_RATES);
    const wasOffline = usePrevious(isOffline);
    // Picking a row only marks it and the footer button moves on, so a workspace that starts out selected can be kept
    // without having to tap it again.
    const [markedPolicyID, setMarkedPolicyID] = useState<string>();

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

        // The form opens straight after this, and nothing there points the draft at the per diem unit once the rates load,
        // so wait for them here before setting the draft up.
        if (!perDiemUnit) {
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
        setCustomUnitID(transactionID, perDiemUnit.customUnitID);
        setMoneyRequestCategory(transactionID, perDiemUnit.defaultCategory ?? '', undefined);

        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(action, targetIouType, transactionID, targetReport.reportID));
    };

    const {
        initiallyFocusedKey,
        selectedPolicyID,
        workspaceOptions,
        filteredWorkspaceOptions,
        inputValue,
        setInputValue,
        selectWorkspace: confirmWorkspace,
    } = useRequestStepWorkspaceList({
        transaction,
        getPolicies: getActivePoliciesWithExpenseChatAndPerDiemEnabled,
        onSelectWorkspace: selectWorkspace,
        markedPolicyID,
    });

    useEffect(() => {
        if (!pendingPolicyID || !getPerDiemCustomUnit(pendingPolicy)) {
            return;
        }
        const frame = requestAnimationFrame(() => selectWorkspace(pendingPolicy));
        return () => cancelAnimationFrame(frame);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pendingPolicy, pendingPolicyID]);

    useEffect(() => {
        // The fetch was dropped while offline, so ask again once back online rather than leave the loader up.
        if (!pendingPolicyID || getPerDiemCustomUnit(pendingPolicy) || !wasOffline || isOffline) {
            return;
        }
        fetchPerDiemRates(pendingPolicyID);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOffline]);

    // Once the fetch finishes without giving the workspace a per diem unit, e.g. it failed, show the list again so the
    // user can pick the workspace again instead of waiting on a loader that never ends.
    const isWaitingForPerDiemRates = !!pendingPolicyID && (!!getPerDiemCustomUnit(pendingPolicy) || isOffline || isLoadingPerDiemRates !== false);

    if (isWaitingForPerDiemRates) {
        if (isOffline) {
            return <FullPageOfflineBlockingView>{null}</FullPageOfflineBlockingView>;
        }
        return (
            <View style={[styles.flex1, styles.fullScreenLoading]}>
                <ActivityIndicator size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE} />
            </View>
        );
    }

    return (
        <>
            <RequestStepWorkspaceListHeader
                workspaceCount={workspaceOptions.length}
                filteredWorkspaceCount={filteredWorkspaceOptions.length}
                inputValue={inputValue}
                onChangeText={setInputValue}
            />
            <SelectionList
                key={initiallyFocusedKey}
                data={filteredWorkspaceOptions}
                onSelectRow={(item) => setMarkedPolicyID(item.policyID)}
                confirmButtonOptions={{
                    showButton: true,
                    text: translate('common.next'),
                    onConfirm: () => {
                        confirmWorkspace(selectedPolicyID);
                    },
                    isDisabled: !selectedPolicyID,
                }}
                ListItem={UserListItem}
                initiallyFocusedItemKey={initiallyFocusedKey}
            />
        </>
    );
}

export default withFullTransactionOrNotFound(IOURequestStepPerDiemWorkspace);
