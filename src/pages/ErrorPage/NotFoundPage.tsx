import React from 'react';
import type {FullPageNotFoundViewProps} from '@components/BlockingViews/FullPageNotFoundView';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ScreenWrapper from '@components/ScreenWrapper';

type NotFoundPageProps = {
    onBackButtonPress?: () => void;
} & FullPageNotFoundViewProps;

// eslint-disable-next-line rulesdir/no-negated-variables
function NotFoundPage({onBackButtonPress, ...fullPageNotFoundViewProps}: NotFoundPageProps) {
    return (
        <ScreenWrapper testID={NotFoundPage.displayName}>
            <FullPageNotFoundView
                shouldShow
                onBackButtonPress={onBackButtonPress}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...fullPageNotFoundViewProps}
            />
        </ScreenWrapper>
    );
}

NotFoundPage.displayName = 'NotFoundPage';

export default NotFoundPage;
