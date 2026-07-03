import type { FilterConfig, IsItemInFilterCallback } from "@components/Table";
import type {
  DomainMemberRowData,
  DomainMembersTableFilterKey,
} from "@components/Tables/DomainMembersTable";
import CONST from "@src/CONST";
import ONYXKEYS from "@src/ONYXKEYS";

import type { DomainSecurityGroupWithID } from "@selectors/Domain";

import { groupsSelector } from "@selectors/Domain";

import useLocalize from "./useLocalize";
import useOnyx from "./useOnyx";

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

function useDomainGroupFilter(
  domainAccountID: number,
): UseDomainGroupFilterResult {
  const { translate } = useLocalize();

  const [groups] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
    selector: groupsSelector,
  });

  const shouldShowGroupFilter = (groups?.length ?? 0) > 1;
  const shouldShowGroupColumn = (groups?.length ?? 0) > 0;

  const filterConfig: FilterConfig<DomainMembersTableFilterKey> | undefined =
    !shouldShowGroupFilter
      ? undefined
      : {
          group: {
            label: translate("common.group"),
            filterType: CONST.TABLES.FILTER_TYPE.SINGLE_SELECT,
            options: (groups ?? []).map((group) => ({
              label: group.details.name ?? "",
              value: group.id,
            })),
          },
        };

  const isItemInFilter:
    | IsItemInFilterCallback<DomainMemberRowData>
    | undefined = !shouldShowGroupFilter
    ? undefined
    : (item, filterValues) => {
        const filterValue = filterValues.at(0);
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
