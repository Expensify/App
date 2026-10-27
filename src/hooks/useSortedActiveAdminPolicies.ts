import {sortPoliciesByName} from '@libs/PolicyUtils';

import useActiveAdminPolicies from './useActiveAdminPolicies';
import useLocalize from './useLocalize';

function useSortedActiveAdminPolicies() {
    const {localeCompare} = useLocalize();
    const activeAdminPolicies = useActiveAdminPolicies();
    const sortedActiveAdminPolicies = sortPoliciesByName(activeAdminPolicies, localeCompare);

    return sortedActiveAdminPolicies;
}

export default useSortedActiveAdminPolicies;
