import {usePersonalDetails} from '@components/OnyxListItemProvider';

import useLocalize from '@hooks/useLocalize';

import {sortIconsByName} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import type {Icon} from '@src/types/onyx/OnyxCommon';

import type {ValueOf} from 'type-fest';

import lodashSortBy from 'lodash/sortBy';

type SortingOption = ValueOf<typeof CONST.REPORT_ACTION_AVATARS.SORT_BY>;

/** Orders avatars for a horizontal stack, where every avatar sits in an equivalent slot. `undefined` keeps the given order. */
function useSortedIcons(icons: Icon[], sort?: SortingOption | SortingOption[]): Icon[] {
    const {localeCompare} = useLocalize();
    const personalDetails = usePersonalDetails();
    const sortBy: SortingOption[] = sort === undefined ? [] : [sort].flat();

    let sortedIcons = icons;
    if (sortBy.includes(CONST.REPORT_ACTION_AVATARS.SORT_BY.NAME)) {
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
