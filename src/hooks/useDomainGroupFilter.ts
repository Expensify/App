import type {FilterConfig, IsItemInFilterCallback} from '@components/Table';
import type {DomainMemberRowData, DomainMembersTableFilterKey} from '@components/Tables/DomainMembersTable';
import {sortAlphabetically} from '@libs/OptionsListUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {DomainSecurityGroupWithID} from '@selectors/Domain';

import {groupsSelector} from '@selectors/Domain';

import useLocalize from './useLocalize';
import useOnyx from './useOnyx';

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
    const {translate, localeCompare} = useLocalize();

    const [groups] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        selector: groupsSelector,
    });

    const shouldShowGroupFilter = (groups?.length ?? 0) > 1;
    const shouldShowGroupColumn = (groups?.length ?? 0) > 0;

    const groupFilterOptions = sortAlphabetically(
        (groups ?? []).map((group) => ({
            label: group.details.name ?? '',
            value: group.id,
        })),
        'label',
        localeCompare,
    );

    const filterConfig: FilterConfig<DomainMembersTableFilterKey> | undefined = !shouldShowGroupFilter
        ? undefined
        : {
              group: {
                  label: translate('common.group'),
                  filterType: CONST.TABLES.FILTER_TYPE.MULTI_SELECT,
                  options: groupFilterOptions,
              },
          };

    const isItemInFilter: IsItemInFilterCallback<DomainMemberRowData> | undefined = !shouldShowGroupFilter
        ? undefined
        : (item, filterValues) => {
              if (filterValues.length === 0) {
                  return true;
              }

              for (const filterValue of filterValues) {
                  const matchedGroup = groups?.find((group) => group.id === filterValue);

                  if (matchedGroup && String(item.accountID) in matchedGroup.details.shared) {
                      return true;
                  }
              }

              return false;
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
