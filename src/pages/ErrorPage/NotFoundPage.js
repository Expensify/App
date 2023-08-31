import React from 'react';
import ScreenWrapper from '../../components/ScreenWrapper';
import FullPageNotFoundView from '../../components/BlockingViews/FullPageNotFoundView';
import Navigation from '../../libs/Navigation/Navigation';

// eslint-disable-next-line rulesdir/no-negated-variables
function NotFoundPage() {
    return (
        <ScreenWrapper>
            <FullPageNotFoundView
                shouldShow 
                onLinkPress={Navigation.navigate}
            />
        </ScreenWrapper>
    );
}

NotFoundPage.displayName = 'NotFoundPage';

export default NotFoundPage;
