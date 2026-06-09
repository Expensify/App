import {useEffect, useEffectEvent, useState} from 'react';
import {setMergeHRGroupsAutoNavigated} from '@libs/actions/connections/MergeHR';
import {isMergeHRCompleteSetupNeeded} from '@libs/HRUtils';
import Navigation from '@libs/Navigation/Navigation';
// eslint-disable-next-line no-restricted-imports -- the hook does not use React Navigation hooks internally (isFocused is passed in as a parameter), so there is no navigation instance available to use navigation.addListener for transition detection.
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import Visibility from '@libs/Visibility';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import useOnyx from './useOnyx';
import usePolicy from './usePolicy';

/**
 * Auto-navigates the admin into the Merge HR group selector RHP the first time the initial sync
 * completes and groups become available for selection.
 */
function useMergeHRGroupsAutoNavigate(policyID: string, isFocused: boolean) {
    const policy = usePolicy(policyID);
    const [wasAutoNavigated] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_MERGE_HR_GROUPS_AUTO_NAVIGATED}${policyID}`);
    const [isAppVisible, setIsAppVisible] = useState(Visibility.isVisible);
    const [isAnyModalVisible] = useOnyx(ONYXKEYS.MODAL, {selector: (modal) => !!modal?.isVisible});

    useEffect(() => Visibility.onVisibilityChange(() => setIsAppVisible(Visibility.isVisible())), []);

    const goToGroupSelector = useEffectEvent(() => {
        if (wasAutoNavigated) {
            return;
        }
        setMergeHRGroupsAutoNavigated(policyID);
        Navigation.navigate(ROUTES.WORKSPACE_HR_MERGE_GROUPS.getRoute(policyID));
    });

    const completeSetupNeeded = isMergeHRCompleteSetupNeeded(policy);

    useEffect(() => {
        if (!completeSetupNeeded || !isFocused || !isAppVisible || isAnyModalVisible) {
            return;
        }

        const handle = TransitionTracker.runAfterTransitions({callback: goToGroupSelector, waitForUpcomingTransition: true});
        return () => handle.cancel();
    }, [completeSetupNeeded, isFocused, isAppVisible, isAnyModalVisible]);
}

export default useMergeHRGroupsAutoNavigate;
