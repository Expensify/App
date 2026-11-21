/**
 * The Spend searches under the Spend row. Working out which searches the user can see and their to-do counts reads a lot of Onyx,
 * so the bar only mounts this while the Spend tab is selected.
 */
import useNetwork from '@hooks/useNetwork';
import useSingleExecution from '@hooks/useSingleExecution';

import {buildFlatNavSubnavGroups} from '@libs/Navigation/FlatNav/FlatNavUtils';
import useActiveFlatNavItem from '@libs/Navigation/FlatNav/useActiveFlatNavItem';
import useFlatNavNavigation from '@libs/Navigation/FlatNav/useFlatNavNavigation';
import useFlatNavSections from '@libs/Navigation/FlatNav/useFlatNavSections';

import React from 'react';

import FlatNavSubnav from './FlatNavSubnav';

type FlatNavSpendSubnavProps = {
    /** Whether the bar is drawn as an icon rail, which has no room for the subnav */
    isVisuallyCollapsed: boolean;
};

function FlatNavSpendSubnav({isVisuallyCollapsed}: FlatNavSpendSubnavProps) {
    const {singleExecution} = useSingleExecution();
    const {isOffline} = useNetwork();
    const sections = useFlatNavSections();
    const activeItem = useActiveFlatNavItem(sections, true);
    const {navigateToItem} = useFlatNavNavigation();

    return (
        <FlatNavSubnav
            groups={buildFlatNavSubnavGroups({sections, isOffline})}
            activeItem={activeItem}
            isVisible={!isVisuallyCollapsed}
            onItemPress={singleExecution(navigateToItem)}
        />
    );
}

export default FlatNavSpendSubnav;
