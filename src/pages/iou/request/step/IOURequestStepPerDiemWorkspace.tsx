import React, {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import * as Expensicons from '@components/Icon/Expensicons';
import SelectionList from '@components/SelectionList';
import type {ListItem} from '@components/SelectionList/types';
import UserListItem from '@components/SelectionList/UserListItem';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import {canSubmitPerDiemExpenseFromWorkspace, getActivePolicies, getPerDiemCustomUnit, getPolicy, sortWorkspacesBySelected} from '@libs/PolicyUtils';
import {getDefaultWorkspaceAvatar, getPolicyExpenseChat} from '@libs/ReportUtils';
import {setCustomUnitID, setMoneyRequestCategory, setMoneyRequestParticipants} from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithFullTransactionOrNotFoundProps} from './withFullTransactionOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';

type WorkspaceListItem = ListItem & {
    value: string;
};

type IOURequestStepPerDiemWorkspaceProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.CREATE> & WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.CREATE>;

function IOURequestStepPerDiemWorkspace({
    route: {
        params: {transactionID, action, iouType},
    },
    transaction,
}: IOURequestStepPerDiemWorkspaceProps) {
    const {translate} = useLocalize();
    const {login: currentUserLogin, accountID} = useCurrentUserPersonalDetails();
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);

    const selectedWorkspace = useMemo(() => transaction?.participants?.[0], [transaction]);

    const workspaceOptions: WorkspaceListItem[] = useMemo(() => {
        const availableWorkspaces = getActivePolicies(allPolicies, currentUserLogin).filter((policy) => canSubmitPerDiemExpenseFromWorkspace(policy));

        return availableWorkspaces
            .sort((policy1, policy2) => sortWorkspacesBySelected({policyID: policy1.id, name: policy1.name}, {policyID: policy2.id, name: policy2.name}, selectedWorkspace?.policyID))
            .map((policy) => ({
                text: policy.name,
                value: policy.id,
                keyForList: policy.id,
                icons: [
                    {
                        id: policy.id,
                        source: policy?.avatarURL ? policy.avatarURL : getDefaultWorkspaceAvatar(policy.name),
                        fallbackIcon: Expensicons.FallbackWorkspaceAvatar,
                        name: policy.name,
                        type: CONST.ICON_TYPE_WORKSPACE,
                    },
                ],
                isSelected: selectedWorkspace?.policyID === policy.id,
            }));
    }, [allPolicies, currentUserLogin, selectedWorkspace]);

    const selectWorkspace = (item: WorkspaceListItem) => {
        const policyExpenseReportID = getPolicyExpenseChat(accountID, item.value)?.reportID;
        if (!policyExpenseReportID) {
            return;
        }
        const selectedPolicy = getPolicy(item.value, allPolicies);
        const perDiemUnit = getPerDiemCustomUnit(selectedPolicy);
        setMoneyRequestParticipants(transactionID, [
            {
                selected: true,
                accountID: 0,
                isPolicyExpenseChat: true,
                reportID: policyExpenseReportID,
                policyID: item.value,
            },
        ]);
        setCustomUnitID(transactionID, perDiemUnit?.customUnitID ?? CONST.CUSTOM_UNITS.FAKE_P2P_ID);
        setMoneyRequestCategory(transactionID, perDiemUnit?.defaultCategory ?? '');
        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_DESTINATION.getRoute(action, iouType, transactionID, policyExpenseReportID));
    };

    return (
        <SelectionList
            key={selectedWorkspace?.policyID}
            sections={[{data: workspaceOptions, title: translate('common.workspaces')}]}
            onSelectRow={selectWorkspace}
            shouldSingleExecuteRowSelect
            ListItem={UserListItem}
            initiallyFocusedOptionKey={selectedWorkspace?.policyID}
        />
    );
}

IOURequestStepPerDiemWorkspace.displayName = 'IOURequestStepPerDiemWorkspace';

export default withWritableReportOrNotFound(withFullTransactionOrNotFound(IOURequestStepPerDiemWorkspace));
