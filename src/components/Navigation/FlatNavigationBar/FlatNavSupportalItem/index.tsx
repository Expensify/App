/** The flat navigation bar's Supportal row, together with the switcher it opens right above itself. Desktop web only, see the native stub. */
import FlatNavItem from '@components/Navigation/FlatNavigationBar/FlatNavItem';
import SupportalSwitcherPopover from '@components/Navigation/SupportalSwitcher/SupportalSwitcherPopover';
import useSupportalSwitcherAnchor from '@components/Navigation/SupportalSwitcher/useSupportalSwitcherAnchor';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';

import CONST from '@src/CONST';

import React, {useState} from 'react';

type FlatNavSupportalItemProps = {
    /** Keeps only the icon, so the bar can narrow to an icon rail */
    isCollapsed: boolean;

    /** Whether the user may use the switcher at all */
    isSupportAgent: boolean;

    /** Whether the row shows. The row also stays while the switcher is on screen, so the switcher keeps its anchor and can hand focus back to it. */
    isRowVisible: boolean;

    isSwitcherVisible: boolean;

    showSwitcher: () => void;

    hideSwitcher: () => void;

    /** Called once the switcher has fully closed and its modal is gone from the screen */
    onSwitcherHidden?: () => void;
};

/** Opens the supportal switcher, which signs a support agent into another account. */
function FlatNavSupportalItem({isCollapsed, isSupportAgent, isRowVisible, isSwitcherVisible, showSwitcher, hideSwitcher, onSwitcherHidden}: FlatNavSupportalItemProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['UserSearch']);
    const {anchorRef, anchorPosition, openSwitcher} = useSupportalSwitcherAnchor(showSwitcher);

    // The switcher is still on screen through its close animation, and only then gives focus back to the row.
    // Dropping the row as soon as the switcher starts closing would lose that focus, so the row waits for the modal to be gone.
    const [isSwitcherOnScreen, setIsSwitcherOnScreen] = useState(isSwitcherVisible);
    if (isSwitcherVisible && !isSwitcherOnScreen) {
        setIsSwitcherOnScreen(true);
    }

    const finishHidingSwitcher = () => {
        setIsSwitcherOnScreen(false);
        onSwitcherHidden?.();
    };

    if (!isSupportAgent) {
        return null;
    }

    return (
        <>
            <SupportalSwitcherPopover
                isVisible={isSwitcherVisible}
                anchorRef={anchorRef}
                anchorPosition={anchorPosition}
                onClose={hideSwitcher}
                onModalHide={finishHidingSwitcher}
            />
            {(isRowVisible || isSwitcherOnScreen) && (
                <FlatNavItem
                    ref={anchorRef}
                    isCollapsed={isCollapsed}
                    label={translate('supportalSwitcher.navigationLabel')}
                    icon={icons.UserSearch}
                    accessibilityLabel={translate('supportalSwitcher.title')}
                    role={CONST.ROLE.BUTTON}
                    isSelected={false}
                    isExpanded={isSwitcherVisible}
                    // Same action as the floating action button it replaces, so it keeps that button's Sentry and FullStory identifier.
                    sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.SUPPORTAL_SWITCHER_BUTTON}
                    onPress={openSwitcher}
                />
            )}
        </>
    );
}

export default FlatNavSupportalItem;
