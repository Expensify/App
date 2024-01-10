import React from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ScreenWrapper from '@components/ScreenWrapper';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

type NotFoundPageProps = {
    onBackButtonPress?: () => void;
};

// eslint-disable-next-line rulesdir/no-negated-variables
function NotFoundPage({onBackButtonPress = () => Navigation.goBack(ROUTES.HOME)}: NotFoundPageProps) {
    return (
        <ScreenWrapper testID={NotFoundPage.displayName}>
            <FullPageNotFoundView
                shouldShow
                onBackButtonPress={onBackButtonPress}
                onLinkPress={() => Navigation.dismissModal()}
            />
        </ScreenWrapper>
    );
}

NotFoundPage.displayName = 'NotFoundPage';

export default NotFoundPage;
