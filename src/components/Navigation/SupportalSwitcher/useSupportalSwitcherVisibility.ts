import useOnyx from '@hooks/useOnyx';

import ONYXKEYS from '@src/ONYXKEYS';

import {canSupportLoginSelector} from '@selectors/Account';
import {isSupportalSessionSelector} from '@selectors/Session';
import {useState} from 'react';

/** Open state of the supportal switcher, shared by every trigger that opens it, plus whether the user may use it at all. */
function useSupportalSwitcherVisibility() {
    const [canSupportLogin] = useOnyx(ONYXKEYS.ACCOUNT, {
        selector: canSupportLoginSelector,
    });
    const [isSupportalSession] = useOnyx(ONYXKEYS.SESSION, {
        selector: isSupportalSessionSelector,
    });
    const [isSwitcherActive, setIsSwitcherActive] = useState(false);

    // During supportal the account is the customer, so canSupportLogin goes false while switching.
    const isSupportAgent = (canSupportLogin ?? false) || !!isSupportalSession;

    const showSwitcher = () => {
        setIsSwitcherActive(true);
    };

    const hideSwitcher = () => {
        setIsSwitcherActive(false);
    };

    return {
        isSupportAgent,
        // Losing the permission while the switcher is open must not leave a bar holding its peek for a popover that is gone.
        isSwitcherVisible: isSwitcherActive && isSupportAgent,
        showSwitcher,
        hideSwitcher,
    };
}

export default useSupportalSwitcherVisibility;
