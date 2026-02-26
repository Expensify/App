import {useMemo} from 'react';
import {sortPoliciesByName} from '@libs/PolicyUtils';
import useActiveAdminPolicies from './useActiveAdminPolicies';
import useLocalize from './useLocalize';

function useSortedActiveAdminPolicies() {
    const {localeCompare} = useLocalize();
    const activeAdminPolicies = useActiveAdminPolicies();
    const sortedActiveAdminPolicies = useMemo(() => sortPoliciesByName(activeAdminPolicies, localeCompare), [activeAdminPolicies, localeCompare]);

    return sortedActiveAdminPolicies;
}

export default useSortedActiveAdminPolicies;
