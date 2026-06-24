import React from 'react';
import type {RefObject} from 'react';
import FloatingActionButton from '@components/FloatingActionButton';
import useLocalize from '@hooks/useLocalize';
import CONST from '@src/CONST';
import useScanActions from './useScanActions';

type FABButtonsProps = {
    isActive: boolean;
    fabRef: RefObject<HTMLDivElement | null>;
    onPress: () => void;
};

function FABButtons({isActive, fabRef, onPress}: FABButtonsProps) {
    const {translate} = useLocalize();
    const {startScan} = useScanActions();

    return (
        <FloatingActionButton
            accessibilityLabel={translate('accessibilityHints.openActionsMenu')}
            role={CONST.ROLE.BUTTON}
            isActive={isActive}
            ref={fabRef}
            onPress={onPress}
            onLongPress={startScan}
            sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.FLOATING_ACTION_BUTTON}
        />
    );
}

export default FABButtons;
