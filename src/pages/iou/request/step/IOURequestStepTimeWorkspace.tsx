import React from 'react';
import {View} from 'react-native';
import SearchBar from '@components/SearchBar';
import SelectionList from '@components/SelectionList';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import UserListItem from '@components/SelectionList/ListItem/UserListItem';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSearchResults from '@hooks/useSearchResults';
import useThemeStyles from '@hooks/useThemeStyles';
import {shouldUseTransactionDraft} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getActivePoliciesWithExpenseChatAndTimeEnabled, getDefaultTimeTrackingRate, sortWorkspacesBySelected} from '@libs/PolicyUtils';
import {getDefaultWorkspaceAvatar, getPolicyExpenseChat} from '@libs/ReportUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import {setMoneyRequestParticipants, setMoneyRequestTimeRate} from '@userActions/IOU';
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

type IOURequestStepTimeWorkspaceProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.CREATE> & WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.CREATE>;

function IOURequestStepTimeWorkspace({
    route: {
        params: {action, iouType, transactionID, reportID, reportActionID},
    },
    transaction,
}: IOURequestStepTimeWorkspaceProps) {
    const icons = useMemoizedLazyExpensifyIcons(['FallbackWorkspaceAvatar']);
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const isTransactionDraft = shouldUseTransactionDraft(action);

    const {login: currentUserLogin, accountID} = useCurrentUserPersonalDetails();
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const selectedWorkspace = transaction?.participants?.[0];
    const availableWorkspaces = getActivePoliciesWithExpenseChatAndTimeEnabled(allPolicies, currentUserLogin);
    const workspaceOptions: WorkspaceListItem[] = availableWorkspaces
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
                    fallbackIcon: icons.FallbackWorkspaceAvatar,
                    name: policy.name,
                    type: CONST.ICON_TYPE_WORKSPACE,
                },
            ],
            isSelected: selectedWorkspace?.policyID === policy.id,
        }));

    const filterWorkspace = (workspaceOption: WorkspaceListItem, searchInput: string) => {
        const results = tokenizedSearch([workspaceOption], searchInput, (option) => [option.text ?? '']);
        return results.length > 0;
    };
    const sortWorkspaces = (data: WorkspaceListItem[]) => data.sort((a, b) => localeCompare(a.text ?? '', b?.text ?? ''));
    const [inputValue, setInputValue, filteredWorkspaceOptions] = useSearchResults(workspaceOptions, filterWorkspace, sortWorkspaces);

    const selectWorkspace = (item: WorkspaceListItem) => {
        const policyExpenseReportID = getPolicyExpenseChat(accountID, item.value)?.reportID;
        if (!policyExpenseReportID) {
            return;
        }
        setMoneyRequestParticipants(
            transactionID,
            [
                {
                    selected: true,
                    accountID: 0,
                    isPolicyExpenseChat: true,
                    reportID: policyExpenseReportID,
                    policyID: item.value,
                },
            ],
            false,
            true,
        );

        const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${item.value}`];
        const defaultRate = policy ? getDefaultTimeTrackingRate(policy) : undefined;
        if (defaultRate) {
            setMoneyRequestTimeRate(transactionID, defaultRate, isTransactionDraft);
        }

        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_HOURS.getRoute(action, iouType, transactionID, reportID, reportActionID));
    };

    return (
        <>
            {workspaceOptions.length > CONST.SEARCH_ITEM_LIMIT ? (
                <SearchBar
                    label={translate('workspace.common.findWorkspace')}
                    inputValue={inputValue}
                    onChangeText={setInputValue}
                    shouldShowEmptyState={workspaceOptions.length > 0 && filteredWorkspaceOptions.length === 0}
                />
            ) : (
                <View style={[styles.optionsListSectionHeader]}>
                    <Text style={[styles.ph5, styles.textLabelSupporting]}>{translate('iou.chooseWorkspace')}</Text>
                </View>
            )}
            <SelectionList
                key={selectedWorkspace?.policyID}
                data={filteredWorkspaceOptions}
                onSelectRow={selectWorkspace}
                shouldSingleExecuteRowSelect
                ListItem={UserListItem}
                initiallyFocusedItemKey={selectedWorkspace?.policyID}
            />
        </>
    );
}

// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepTimeWorkspaceWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepTimeWorkspace);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepTimeWorkspaceWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepTimeWorkspaceWithWritableReportOrNotFound);

export default IOURequestStepTimeWorkspaceWithFullTransactionOrNotFound;
