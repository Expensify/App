import {emailSelector} from '@selectors/Session';
import React, {useMemo} from 'react';
import * as Expensicons from '@components/Icon/Expensicons';
import SelectionList from '@components/SelectionList';
import UserListItem from '@components/SelectionList/ListItem/UserListItem';
import type {ListItem} from '@components/SelectionList/types';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import Navigation from '@libs/Navigation/Navigation';
import {canSendInvoiceFromWorkspace, getActiveAdminWorkspaces, sortWorkspacesBySelected} from '@libs/PolicyUtils';
import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';
import {setMoneyRequestParticipants} from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithFullTransactionOrNotFoundProps} from './withFullTransactionOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';

type WorkspaceListItem = ListItem & {
    value: string;
};

type IOURequestStepSendFromProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_SEND_FROM> &
    WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_SEND_FROM>;

function IOURequestStepSendFrom({route, transaction}: IOURequestStepSendFromProps) {
    const {translate, localeCompare} = useLocalize();
    const {transactionID, backTo} = route.params;
    const [currentUserLogin] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector, canBeMissing: false});
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});

    const selectedWorkspace = useMemo(() => transaction?.participants?.find((participant) => participant.isSender), [transaction]);

    const workspaceOptions: WorkspaceListItem[] = useMemo(() => {
        const availableWorkspaces = getActiveAdminWorkspaces(allPolicies, currentUserLogin).filter((policy) => canSendInvoiceFromWorkspace(policy.id));

        return availableWorkspaces
            .sort((policy1, policy2) =>
                sortWorkspacesBySelected(
                    {policyID: policy1.id, name: policy1.name},
                    {policyID: policy2.id, name: policy2.name},
                    selectedWorkspace?.policyID ? [selectedWorkspace?.policyID] : [],
                    localeCompare,
                ),
            )
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
    }, [allPolicies, currentUserLogin, selectedWorkspace?.policyID, localeCompare]);

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    const selectWorkspace = (item: WorkspaceListItem) => {
        const newParticipants = (transaction?.participants ?? []).filter((participant) => participant.accountID);

        newParticipants.push({
            policyID: item.value,
            isSender: true,
            selected: false,
        });

        setMoneyRequestParticipants(transactionID, newParticipants);
        navigateBack();
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('workspace.invoices.sendFrom')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            testID={IOURequestStepSendFrom.displayName}
            includeSafeAreaPaddingBottom
        >
            <SelectionList
                data={workspaceOptions}
                onSelectRow={selectWorkspace}
                shouldSingleExecuteRowSelect
                ListItem={UserListItem}
                initiallyFocusedItemKey={selectedWorkspace?.policyID}
            />
        </StepScreenWrapper>
    );
}

IOURequestStepSendFrom.displayName = 'IOURequestStepSendFrom';

export default withWritableReportOrNotFound(withFullTransactionOrNotFound(IOURequestStepSendFrom));
