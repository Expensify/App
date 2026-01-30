import React from 'react';
import {View} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
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
import {sortWorkspacesBySelected} from '@libs/PolicyUtils';
import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';
import type {WithFullTransactionOrNotFoundProps} from './withFullTransactionOrNotFound';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';

type WorkspaceListItem = ListItem & {
    value: string;
};

type BaseRequestStepWorkspaceProps = WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.CREATE> & {
    /** Function returning available workspaces for the list. */
    getPolicies: (allPolicies: OnyxCollection<Policy>, currentUserLogin: string | undefined) => Policy[];

    /** Function to run after selecting a workspace. */
    onSelectWorkspace: (policy: OnyxEntry<Policy>) => void;
};

function BaseRequestStepWorkspace({transaction, getPolicies, onSelectWorkspace}: BaseRequestStepWorkspaceProps) {
    const icons = useMemoizedLazyExpensifyIcons(['FallbackWorkspaceAvatar']);
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();

    const {login: currentUserLogin} = useCurrentUserPersonalDetails();
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const selectedWorkspace = transaction?.participants?.[0];
    const availableWorkspaces = getPolicies(allPolicies, currentUserLogin);
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

    const selectWorkspace = (item: WorkspaceListItem) => onSelectWorkspace(allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${item.value}`]);

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

export default withFullTransactionOrNotFound(BaseRequestStepWorkspace);
