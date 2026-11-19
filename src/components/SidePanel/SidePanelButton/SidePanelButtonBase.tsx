import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSidePanelActions from '@hooks/useSidePanelActions';
import useSidePanelState from '@hooks/useSidePanelState';

import CONST from '@src/CONST';

import React from 'react';

import type SidePanelButtonProps from './types';

import ConciergePageButton from './ConciergePageButton';
import HelpButton from './HelpButton';

function SidePanelButtonBase({style}: SidePanelButtonProps) {
    const {shouldHideHelpButton} = useSidePanelState();
    const {openSidePanel} = useSidePanelActions();
    const {isBetaEnabled} = usePermissions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const shouldOpenConciergePage = shouldUseNarrowLayout && isBetaEnabled(CONST.BETAS.FLAT_NAV);
    if (shouldHideHelpButton) {
        return null;
    }

    if (shouldOpenConciergePage) {
        return <ConciergePageButton style={style} />;
    }

    return (
        <HelpButton
            style={style}
            onPress={openSidePanel}
        />
    );
}

export default SidePanelButtonBase;
