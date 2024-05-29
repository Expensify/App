import React, {useMemo} from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxCollection} from 'react-native-onyx';
import * as Expensicons from '@components/Icon/Expensicons';
import SelectionList from '@components/SelectionList';
import type {ListItem} from '@components/SelectionList/types';
import UserListItem from '@components/SelectionList/UserListItem';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';
import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithFullTransactionOrNotFoundProps} from './withFullTransactionOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';

type WorkspaceListItem = ListItem & {
    value: string;
};

type IOURequestStepSendFromOnyxProps = {
    /** The list of all policies */
    allPolicies: OnyxCollection<Policy>;
};

type IOURequestStepSendFromProps = IOURequestStepSendFromOnyxProps &
    WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_SEND_FROM> &
    WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_SEND_FROM>;

function IOURequestStepSendFrom({route, transaction, allPolicies}: IOURequestStepSendFromProps) {
    const {translate} = useLocalize();
    const {transactionID, backTo} = route.params;

    const selectedWorkspace = useMemo(() => transaction?.participants?.find((participant) => participant.isSender), [transaction]);

    const workspaceOptions: WorkspaceListItem[] = useMemo(() => {
        const activeAdminWorkspaces = PolicyUtils.getActiveAdminWorkspaces(allPolicies);
        return activeAdminWorkspaces.map((policy) => ({
            text: policy.name,
            value: policy.id,
            keyForList: policy.id,
            icons: [
                {
                    id: policy.id,
                    source: policy?.avatarURL ? policy.avatarURL : ReportUtils.getDefaultWorkspaceAvatar(policy.name),
                    fallbackIcon: Expensicons.FallbackWorkspaceAvatar,
                    name: policy.name,
                    type: CONST.ICON_TYPE_WORKSPACE,
                },
            ],
            isSelected: selectedWorkspace?.policyID === policy.id,
        }));
    }, [allPolicies, selectedWorkspace]);

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

        IOU.setMoneyRequestParticipants(transactionID, newParticipants);
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
                sections={[{data: workspaceOptions, title: translate('common.workspaces')}]}
                onSelectRow={selectWorkspace}
                shouldDebounceRowSelect
                ListItem={UserListItem}
                initiallyFocusedOptionKey={selectedWorkspace?.policyID}
            />
        </StepScreenWrapper>
    );
}

IOURequestStepSendFrom.displayName = 'IOURequestStepSendFrom';

export default withWritableReportOrNotFound(
    withFullTransactionOrNotFound(
        withOnyx<IOURequestStepSendFromProps, IOURequestStepSendFromOnyxProps>({
            allPolicies: {
                key: ONYXKEYS.COLLECTION.POLICY,
            },
        })(IOURequestStepSendFrom),
    ),
);
