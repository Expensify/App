import React from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ScreenWrapper from '@components/ScreenWrapper';

type NotFoundPageProps = {
    onBackButtonPress?: () => void;
    shouldForceFullScreen?: boolean;
};

// eslint-disable-next-line rulesdir/no-negated-variables
function NotFoundPage({onBackButtonPress, shouldForceFullScreen = false}: NotFoundPageProps) {
    return (
        <ScreenWrapper testID={NotFoundPage.displayName}>
            <FullPageNotFoundView
                shouldShow
                shouldForceFullScreen={shouldForceFullScreen}
                onBackButtonPress={onBackButtonPress}
            />
        </ScreenWrapper>
    );
}

NotFoundPage.displayName = 'NotFoundPage';

export default NotFoundPage;
