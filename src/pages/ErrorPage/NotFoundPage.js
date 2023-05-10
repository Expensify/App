import React from 'react';
import ScreenWrapper from '../../components/ScreenWrapper';
import FullPageNotFoundView from '../../components/BlockingViews/FullPageNotFoundView';

// eslint-disable-next-line rulesdir/no-negated-variables
const NotFoundPage = () => (
    <ScreenWrapper>
        <FullPageNotFoundView shouldShow shouldShowBackHomeLink />
    </ScreenWrapper>
);

NotFoundPage.displayName = 'NotFoundPage';

export default NotFoundPage;
