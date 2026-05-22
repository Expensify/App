import {groupsSelector} from '@selectors/Domain';
import type {DomainSecurityGroupWithID} from '@selectors/Domain';
import {useEffect, useState} from 'react';
import type {MultiSelectItem} from '@components/Search/FilterDropdowns/MultiSelectPopup';
import type {MemberOption} from '@pages/domain/BaseDomainMembersPage';
import ONYXKEYS from '@src/ONYXKEYS';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';

type UseDomainGroupFilterResult = {
    /** Pre-filter function for useSearchResults that filters members by the selected groups. */
    groupPreFilter: (item: MemberOption) => boolean;

    /** All group dropdown options. */
    groupOptions: Array<MultiSelectItem<string>>;

    /** The currently selected groups. */
    selectedGroups: Array<MultiSelectItem<string>>;

    /** Handler for when the user changes the group selection. */
    handleGroupChange: (items: Array<MultiSelectItem<string>>) => void;

    /** Display label for the dropdown button. */
    dropdownLabel: string;

    /** The raw security groups from Onyx, needed for per-row group name display. */
    groups: DomainSecurityGroupWithID[] | undefined;
};

function useDomainGroupFilter(domainAccountID: number): UseDomainGroupFilterResult {
    const {translate} = useLocalize();

    const [groups] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {selector: groupsSelector});

    const [selectedGroups, setSelectedGroups] = useState<Array<MultiSelectItem<string>>>([]);

    const groupOptions: Array<MultiSelectItem<string>> = (groups ?? []).map((group) => ({text: group.details.name ?? '', value: group.id}));

    // If any selected groups disappear from Onyx (e.g. during rollback/refresh), remove them
    // from state so they cannot silently reactivate if the same group ID reappears later.
    useEffect(() => {
        if (selectedGroups.length === 0) {
            return;
        }
        const valid = selectedGroups.filter((selectedGroup) => groups?.some((group) => group.id === selectedGroup.value));
        if (valid.length !== selectedGroups.length) {
            setSelectedGroups(valid);
        }
    }, [groups, selectedGroups]);

    let selectedGroupMemberIDs: Set<number> | null = null;
    if (selectedGroups.length > 0) {
        selectedGroupMemberIDs = new Set<number>();
        for (const selectedGroup of selectedGroups) {
            const securityGroup = groups?.find((group) => group.id === selectedGroup.value);
            if (!securityGroup) {
                continue;
            }
            for (const memberKey of Object.keys(securityGroup.details.shared)) {
                const memberID = Number(memberKey);
                if (!Number.isNaN(memberID)) {
                    selectedGroupMemberIDs.add(memberID);
                }
            }
        }
    }

    const groupPreFilter = (item: MemberOption) => !selectedGroupMemberIDs || selectedGroupMemberIDs.has(item.accountID);

    const dropdownLabel = selectedGroups.length > 0 ? selectedGroups.map((g) => g.text).join(', ') : translate('workspace.common.members');

    return {
        groupPreFilter,
        groupOptions,
        selectedGroups,
        handleGroupChange: setSelectedGroups,
        dropdownLabel,
        groups,
    };
}

export default useDomainGroupFilter;
