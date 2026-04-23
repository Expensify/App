import {groupsSelector} from '@selectors/Domain';
import type {DomainSecurityGroupWithID} from '@selectors/Domain';
import {useEffect, useState} from 'react';
import type {SingleSelectItem} from '@components/Search/FilterDropdowns/SingleSelectPopup';
import type {MemberOption} from '@pages/domain/BaseDomainMembersPage';
import ONYXKEYS from '@src/ONYXKEYS';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';

const ALL_MEMBERS_VALUE = 'all';

type UseDomainGroupFilterResult = {
    /** Pre-filter function for useSearchResults that filters members by the selected group. */
    groupPreFilter: (item: MemberOption) => boolean;

    /** All group dropdown options including the "All Members" entry. */
    groupOptions: Array<SingleSelectItem<string>>;

    /** The currently selected group, or null when "All Members" is active. */
    selectedGroup: SingleSelectItem<string> | null;

    /** Handler for when the user picks a different group in the dropdown. */
    handleGroupChange: (item: SingleSelectItem<string> | null) => void;

    /** Display label for the dropdown button. */
    dropdownLabel: string;

    /** Translated "All Members" label (useful as the default value for SingleSelectPopup). */
    allMembersLabel: string;

    /** The raw security groups from Onyx, needed for per-row group name display. */
    groups: DomainSecurityGroupWithID[] | undefined;
};

function useDomainGroupFilter(domainAccountID: number): UseDomainGroupFilterResult {
    const {translate} = useLocalize();

    const [groups] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {selector: groupsSelector});

    const [selectedGroup, setSelectedGroup] = useState<SingleSelectItem<string> | null>(null);

    const allMembersLabel = translate('domain.members.allMembers');

    const groupOptions: Array<SingleSelectItem<string>> = [
        {text: allMembersLabel, value: ALL_MEMBERS_VALUE},
        ...(groups ?? []).map((group) => ({text: group.details.name ?? '', value: group.id})),
    ];

    const matchedGroup = selectedGroup && selectedGroup.value !== ALL_MEMBERS_VALUE ? groups?.find((g) => g.id === selectedGroup.value) : undefined;

    // If the selected group disappears from Onyx (e.g. during rollback/refresh), clear the
    // selection from state so it cannot silently reactivate if the same group ID reappears later.
    useEffect(() => {
        if (!selectedGroup || selectedGroup.value === ALL_MEMBERS_VALUE || matchedGroup) {
            return;
        }
        setSelectedGroup(null);
    }, [matchedGroup, selectedGroup]);

    const effectiveSelection = matchedGroup ? selectedGroup : null;

    const selectedGroupMemberIDs = matchedGroup
        ? new Set(
              Object.keys(matchedGroup.details.shared)
                  .map(Number)
                  .filter((id) => !Number.isNaN(id)),
          )
        : null;

    const groupPreFilter = (item: MemberOption) => !selectedGroupMemberIDs || selectedGroupMemberIDs.has(item.accountID);

    const handleGroupChange = (item: SingleSelectItem<string> | null) => {
        if (!item || item.value === ALL_MEMBERS_VALUE) {
            setSelectedGroup(null);
        } else {
            setSelectedGroup(item);
        }
    };

    const dropdownLabel = effectiveSelection?.text ?? allMembersLabel;

    return {
        groupPreFilter,
        groupOptions,
        selectedGroup: effectiveSelection,
        handleGroupChange,
        dropdownLabel,
        allMembersLabel,
        groups,
    };
}

export default useDomainGroupFilter;
