import React, {useMemo} from 'react';
import {View} from 'react-native';
import * as Expensicons from '@components/Icon/Expensicons';
import SelectionList from '@components/SelectionList';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import UserListItem from '@components/SelectionList/ListItem/UserListItem';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {getActivePoliciesWithExpenseChatAndPerDiemEnabled, getPerDiemCustomUnit, getPolicy, sortWorkspacesBySelected} from '@libs/PolicyUtils';
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
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const {login: currentUserLogin, accountID} = useCurrentUserPersonalDetails();
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});

    const selectedWorkspace = useMemo(() => transaction?.participants?.[0], [transaction]);

    const workspaceOptions: WorkspaceListItem[] = useMemo(() => {
        const availableWorkspaces = getActivePoliciesWithExpenseChatAndPerDiemEnabled(allPolicies, currentUserLogin);

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
    }, [allPolicies, currentUserLogin, selectedWorkspace, localeCompare]);

    const selectWorkspace = (item: WorkspaceListItem) => {
        const policyExpenseReportID = getPolicyExpenseChat(accountID, item.value)?.reportID;
        if (!policyExpenseReportID) {
            return;
        }
        // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
        // eslint-disable-next-line @typescript-eslint/no-deprecated
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
        <>
            <View style={[styles.optionsListSectionHeader]}>
                <Text style={[styles.ph5, styles.textLabelSupporting]}>{translate('iou.chooseWorkspace')}</Text>
            </View>
            <SelectionList
                key={selectedWorkspace?.policyID}
                data={workspaceOptions}
                onSelectRow={selectWorkspace}
                shouldSingleExecuteRowSelect
                ListItem={UserListItem}
                initiallyFocusedItemKey={selectedWorkspace?.policyID}
            />
        </>
    );
}

IOURequestStepPerDiemWorkspace.displayName = 'IOURequestStepPerDiemWorkspace';

export default withWritableReportOrNotFound(withFullTransactionOrNotFound(IOURequestStepPerDiemWorkspace));
