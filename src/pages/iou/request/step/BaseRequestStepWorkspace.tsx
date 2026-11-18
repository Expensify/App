import SelectionList from '@components/SelectionList';
import UserListItem from '@components/SelectionList/ListItem/UserListItem';

import useRequestStepWorkspaceList from '@hooks/useRequestStepWorkspaceList';

import type SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import React from 'react';

import type {WithFullTransactionOrNotFoundProps} from './withFullTransactionOrNotFound';

import RequestStepWorkspaceListHeader from './RequestStepWorkspaceListHeader';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';

type BaseRequestStepWorkspaceProps = WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.CREATE> & {
    /** Function returning available workspaces for the list. */
    getPolicies: (allPolicies: OnyxCollection<Policy>, currentUserLogin: string | undefined) => Policy[];

    /** Function to run after selecting a workspace. */
    onSelectWorkspace: (policy: OnyxEntry<Policy>) => void;
};

function BaseRequestStepWorkspace({transaction, getPolicies, onSelectWorkspace}: BaseRequestStepWorkspaceProps) {
    const {initiallyFocusedKey, workspaceOptions, filteredWorkspaceOptions, inputValue, setInputValue, selectWorkspace} = useRequestStepWorkspaceList({
        transaction,
        getPolicies,
        onSelectWorkspace,
    });

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
                onSelectRow={(item) => selectWorkspace(item.policyID)}
                shouldSingleExecuteRowSelect
                ListItem={UserListItem}
                initiallyFocusedItemKey={initiallyFocusedKey}
            />
        </>
    );
}

export default withFullTransactionOrNotFound(BaseRequestStepWorkspace);
