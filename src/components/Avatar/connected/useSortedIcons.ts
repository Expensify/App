import useLocalize from '@hooks/useLocalize';
import {useAllPersonalDetailsWithoutSnapshots} from '@hooks/usePersonalDetails';

import {sortIconsByName} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import {personalDetailsListSelector} from '@src/selectors/PersonalDetails';
import type {Icon} from '@src/types/onyx/OnyxCommon';

import type {ValueOf} from 'type-fest';

import lodashSortBy from 'lodash/sortBy';

type SortingOption = ValueOf<typeof CONST.REPORT_ACTION_AVATARS.SORT_BY>;

/** Orders avatars for a horizontal stack, where every avatar sits in an equivalent slot. `undefined` keeps the given order. */
function useSortedIcons(icons: Icon[], sort?: SortingOption | SortingOption[]): Icon[] {
    const {localeCompare} = useLocalize();
    const sortBy: SortingOption[] = sort === undefined ? [] : [sort].flat();

    const shouldSortByName = sortBy.includes(CONST.REPORT_ACTION_AVATARS.SORT_BY.NAME);
    // Only a name sort reads personal details, and only for the accounts in the stack
    const [personalDetails] = useAllPersonalDetailsWithoutSnapshots(personalDetailsListSelector(shouldSortByName ? icons.map((icon) => Number(icon.id) || undefined) : undefined));

    let sortedIcons = icons;
    if (shouldSortByName) {
        // `sortIconsByName` sorts in place, so sort a copy and leave the given array as it was
        sortedIcons = sortIconsByName([...icons], personalDetails, localeCompare);
    } else if (sortBy.includes(CONST.REPORT_ACTION_AVATARS.SORT_BY.ID)) {
        sortedIcons = lodashSortBy(icons, (icon) => icon.id);
    }
    if (sortBy.includes(CONST.REPORT_ACTION_AVATARS.SORT_BY.REVERSE)) {
        sortedIcons = [...sortedIcons].reverse();
    }

    return sortedIcons;
}

export default useSortedIcons;
