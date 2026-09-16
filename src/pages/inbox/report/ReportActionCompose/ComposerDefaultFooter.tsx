import OfflineIndicator from '@components/OfflineIndicator';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

import ComposerExceededLength from './ComposerExceededLength';
import ComposerFooter from './ComposerFooter';
import ComposerTypingIndicator from './ComposerTypingIndicator';

function ComposerDefaultFooter() {
    const styles = useThemeStyles();
    // We need isSmallScreenWidth instead of shouldUseNarrowLayout here: only actual small screens get the page-level
    // offline indicator from ScreenWrapper, so RHP chats on wide screens must keep rendering their own inline one.
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    return (
        <ComposerFooter>
            {!isSmallScreenWidth && <OfflineIndicator containerStyles={[styles.chatItemComposeSecondaryRow]} />}
            <ComposerTypingIndicator />
            <ComposerExceededLength />
        </ComposerFooter>
    );
}

export default ComposerDefaultFooter;
