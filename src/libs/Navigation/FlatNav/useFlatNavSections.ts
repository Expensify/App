/**
 * The flat nav sections the user can see, with their items and todo badges. Both the web bar and the mobile bar read it.
 * It does not check the flat nav beta: consumers only mount when the beta is on.
 */
import {useSearchTypeMenuSectionsForNavigation} from '@hooks/useSearchTypeMenuSections';
import useTodoCounts from '@hooks/useTodoCounts';

import type {FlatNavSection} from './types';

import {buildFlatNavSections} from './FlatNavUtils';
import useFlatNavSavedSearchItems from './useFlatNavSavedSearchItems';

type UseFlatNavSectionsParams = {
    /** Pass false while the consumer is off screen, e.g. a closed More popover, to pause expensive to-do classification and saved search title computation. Defaults to true. */
    isActive?: boolean;
};

function useFlatNavSections({isActive = true}: UseFlatNavSectionsParams = {}): FlatNavSection[] {
    const typeMenuSections = useSearchTypeMenuSectionsForNavigation(isActive);
    const {counts} = useTodoCounts(isActive);
    const savedSearchItems = useFlatNavSavedSearchItems(isActive);

    return buildFlatNavSections({typeMenuSections, savedSearchItems, todoCounts: counts});
}

export default useFlatNavSections;
export type {UseFlatNavSectionsParams};
