import React from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {getTypeOptions} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {emailSelector} from '@src/selectors/Session';
import type {Policy} from '@src/types/onyx';
import SingleSelect from './SingleSelect';

type TypeSelectorProps = {
    value: string | undefined;
    onChange: (item: string) => void;
};

/**
 * Extracts only the fields needed by getTypeOptions (canSendInvoice check).
 * Strips heavyweight fields like customUnits, connections, taxRates, fieldList, rules, exportLayouts.
 */
function typeOptionsPoliciesSelector(policies: OnyxCollection<Policy>): OnyxCollection<Policy> {
    if (!policies) {
        return policies;
    }
    const result: OnyxCollection<Policy> = {};
    for (const [key, policy] of Object.entries(policies)) {
        if (!policy) {
            continue;
        }
        result[key] = {
            id: policy.id,
            name: policy.name,
            type: policy.type,
            role: policy.role,
            employeeList: policy.employeeList,
            pendingAction: policy.pendingAction,
            errors: policy.errors,
            areInvoicesEnabled: policy.areInvoicesEnabled,
            isJoinRequestPending: policy.isJoinRequestPending,
            owner: policy.owner,
        } as Policy;
    }
    return result;
}

function TypeSelector({value = CONST.SEARCH.DATA_TYPES.EXPENSE, onChange}: TypeSelectorProps) {
    const {translate} = useLocalize();
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: typeOptionsPoliciesSelector});
    const [sessionEmail] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});

    const types = getTypeOptions(translate, allPolicies, sessionEmail);

    return (
        <SingleSelect
            // text is only needed when the list is searchable
            value={{value, text: ''}}
            items={types}
            onChange={(item) => onChange(item.value)}
        />
    );
}

export {typeOptionsPoliciesSelector};
export default TypeSelector;
