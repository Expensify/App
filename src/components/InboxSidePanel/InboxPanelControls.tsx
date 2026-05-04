import React from 'react';
import useThemeStyles from '@hooks/useThemeStyles';
import AskConciergeInput from './AskConciergeInput';
import InboxPanelToggleButton from './InboxPanelToggleButton';

function InboxPanelControls() {
    const styles = useThemeStyles();

    return (
        <>
            <AskConciergeInput />
            <InboxPanelToggleButton style={styles.mr2} />
        </>
    );
}

export default InboxPanelControls;
