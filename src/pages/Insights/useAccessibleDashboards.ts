import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';

import ONYXKEYS from '@src/ONYXKEYS';

import {getAccessibleDashboards} from './dashboardSpecs';

/** Returns the dashboards the user can open */
function useAccessibleDashboards() {
    const {login} = useCurrentUserPersonalDetails();
    return useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: (policies) => getAccessibleDashboards(policies, login)});
}

export default useAccessibleDashboards;
