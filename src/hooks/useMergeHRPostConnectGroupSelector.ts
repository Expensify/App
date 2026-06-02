import {useEffect, useEffectEvent, useState} from 'react';
import {setMergeHRGroupSelectorAutoShown} from '@libs/actions/connections/MergeHR';
import {isMergeHRConnected, isMergeHRSetupComplete} from '@libs/HRUtils';
import Navigation from '@libs/Navigation/Navigation';
// eslint-disable-next-line no-restricted-imports -- the hook does not use React Navigation hooks internally (isFocused is passed in as a parameter), so there is no navigation instance available to use navigation.addListener for transition detection.
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import Visibility from '@libs/Visibility';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import useOnyx from './useOnyx';
import usePolicy from './usePolicy';

/**
 * Auto-navigates the admin into the Merge HR group/company selector RHP the first time the connection appears
 * after Merge Link authentication completes.
 */
function useMergeHRPostConnectGroupSelector(policyID: string, isFocused: boolean) {
    const policy = usePolicy(policyID);
    const [wasAutoShown] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_MERGE_HR_GROUP_SELECTOR_AUTO_SHOWN}${policyID}`);
    const [isAppVisible, setIsAppVisible] = useState(Visibility.isVisible);
    const [isAnyModalVisible] = useOnyx(ONYXKEYS.MODAL, {selector: (modal) => !!modal?.isVisible});

    useEffect(() => Visibility.onVisibilityChange(() => setIsAppVisible(Visibility.isVisible())), []);

    const goToGroupSelector = useEffectEvent(() => {
        if (wasAutoShown) {
            return;
        }
        setMergeHRGroupSelectorAutoShown(policyID);
        Navigation.navigate(ROUTES.WORKSPACE_HR_MERGE_GROUPS.getRoute(policyID));
    });

    const connected = isMergeHRConnected(policy);
    const setupComplete = isMergeHRSetupComplete(policy);

    useEffect(() => {
        if (!isFocused || !connected || setupComplete || !isAppVisible || isAnyModalVisible) {
            return;
        }

        const handle = TransitionTracker.runAfterTransitions({callback: goToGroupSelector, waitForUpcomingTransition: true});
        return () => handle.cancel();
    }, [connected, setupComplete, isFocused, isAppVisible, isAnyModalVisible]);
}

export default useMergeHRPostConnectGroupSelector;
