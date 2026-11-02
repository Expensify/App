import {groupsSelector} from '@selectors/Domain';
import type {DomainSecurityGroupWithID} from '@selectors/Domain';
import type {FilterConfig, IsItemInFilterCallback} from '@components/Table';
import type {DomainMemberRowData, DomainMembersTableFilterKey} from '@components/Tables/DomainMembersTable';
import ONYXKEYS from '@src/ONYXKEYS';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';

const ALL_MEMBERS_VALUE = 'all';

type UseDomainGroupFilterResult = {
    /** Filter configuration for the domain members table group filter. */
    filterConfig?: FilterConfig<DomainMembersTableFilterKey>;

    /** Callback to determine whether a member matches the active group filter. */
    isItemInFilter?: IsItemInFilterCallback<DomainMemberRowData>;

    /** Whether the group filter should be shown. */
    shouldShowGroupFilter: boolean;

    /** Whether the group column should be shown in the table. */
    shouldShowGroupColumn: boolean;

    /** The raw security groups from Onyx, needed for per-row group name display. */
    groups: DomainSecurityGroupWithID[] | undefined;
};

function useDomainGroupFilter(domainAccountID: number): UseDomainGroupFilterResult {
    const {translate} = useLocalize();

    const [groups] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {selector: groupsSelector});

    const allMembersLabel = translate('domain.members.allMembers');
    const shouldShowGroupFilter = (groups?.length ?? 0) > 1;
    const shouldShowGroupColumn = (groups?.length ?? 0) > 0;

    const filterConfig: FilterConfig<DomainMembersTableFilterKey> | undefined = !shouldShowGroupFilter
        ? undefined
        : {
              group: {
                  label: allMembersLabel,
                  filterType: 'single-select',
                  options: [{label: allMembersLabel, value: ALL_MEMBERS_VALUE}, ...(groups ?? []).map((group) => ({label: group.details.name ?? '', value: group.id}))],
                  default: ALL_MEMBERS_VALUE,
              },
          };

    const isItemInFilter: IsItemInFilterCallback<DomainMemberRowData> | undefined = !shouldShowGroupFilter
        ? undefined
        : (item, filterValues) => {
              const filterValue = filterValues.at(0);

              if (!filterValue || filterValue === ALL_MEMBERS_VALUE) {
                  return true;
              }

              const matchedGroup = groups?.find((group) => group.id === filterValue);

              if (!matchedGroup) {
                  return true;
              }

              return String(item.accountID) in matchedGroup.details.shared;
          };

    return {
        filterConfig,
        isItemInFilter,
        shouldShowGroupFilter,
        shouldShowGroupColumn,
        groups,
    };
}

export default useDomainGroupFilter;
