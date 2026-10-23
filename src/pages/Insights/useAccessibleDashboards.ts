import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';

import ONYXKEYS from '@src/ONYXKEYS';

import {getAccessibleDashboards} from './dashboardSpecs';

/** Returns the dashboards the user can open */
function useAccessibleDashboards() {
    const {login} = useCurrentUserPersonalDetails();
    const {isBetaEnabled} = usePermissions();
    return useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: (policies) => getAccessibleDashboards(policies, login, isBetaEnabled)});
}

export default useAccessibleDashboards;
