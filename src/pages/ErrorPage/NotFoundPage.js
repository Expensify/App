import React from 'react';
import ScreenWrapper from '../../components/ScreenWrapper';
import FullPageNotFoundView from '../../components/BlockingViews/FullPageNotFoundView';

// eslint-disable-next-line rulesdir/no-negated-variables
function NotFoundPage() {
    return (
        <ScreenWrapper>
            <FullPageNotFoundView
                shouldShow
                shouldShowLink
            />
        </ScreenWrapper>
    );
}

NotFoundPage.displayName = 'NotFoundPage';

export default NotFoundPage;
