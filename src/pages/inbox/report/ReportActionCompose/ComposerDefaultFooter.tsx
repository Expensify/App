import OfflineIndicator from '@components/OfflineIndicator';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

import ComposerExceededLength from './ComposerExceededLength';
import ComposerFooter from './ComposerFooter';
import ComposerTypingIndicator from './ComposerTypingIndicator';

function ComposerDefaultFooter() {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return (
        <ComposerFooter>
            {!shouldUseNarrowLayout && <OfflineIndicator containerStyles={[styles.chatItemComposeSecondaryRow]} />}
            <ComposerTypingIndicator />
            <ComposerExceededLength />
        </ComposerFooter>
    );
}

export default ComposerDefaultFooter;
