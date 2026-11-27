/**
 * The More menu of the flat nav tab bar, shown while `MoreMenuStateContext` says it is open or closing. The native bar
 * and the JS bar of narrow web both open it by setting that state.
 */
import MoreMenuStateContext from '@libs/Navigation/MoreMenu/MoreMenuStateContext';

import React, {useContext} from 'react';

import MoreMenuPopover from './MoreMenuPopover';

type MoreMenuProps = {
    /** The focused route of the tab navigator, which decides the highlighted entry */
    focusedTabRouteName: string | undefined;
};

function MoreMenu({focusedTabRouteName}: MoreMenuProps) {
    // The menu is mounted only while it is open or closing, so its data is not read the rest of the time.
    const [moreMenuState, setMoreMenuState] = useContext(MoreMenuStateContext);

    if (moreMenuState === 'closed') {
        return null;
    }

    return (
        <MoreMenuPopover
            isVisible={moreMenuState === 'open'}
            // The menu also reports a close right after a pick, which must not undo what the pick set.
            onClose={() => setMoreMenuState((previousState) => (previousState === 'open' ? 'closing' : previousState))}
            onItemPicked={() => setMoreMenuState('closingAfterPick')}
            // The hide callback can come from an earlier render, so it reads the current state: a menu opened again
            // while it was closing stays mounted.
            onModalHide={() => setMoreMenuState((previousState) => (previousState === 'open' ? previousState : 'closed'))}
            focusedTabRouteName={focusedTabRouteName}
        />
    );
}

export default MoreMenu;
