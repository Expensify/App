import React from 'react';
import type {FullPageNotFoundViewProps} from '@components/BlockingViews/FullPageNotFoundView';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ScreenWrapper from '@components/ScreenWrapper';

type NotFoundPageProps = {
    onBackButtonPress?: () => void;
} & Pick<FullPageNotFoundViewProps, 'subtitleKey' | 'onLinkPress'>;

// eslint-disable-next-line rulesdir/no-negated-variables
function NotFoundPage({onBackButtonPress, subtitleKey, onLinkPress}: NotFoundPageProps) {
    return (
        <ScreenWrapper testID={NotFoundPage.displayName}>
            <FullPageNotFoundView
                shouldShow
                onBackButtonPress={onBackButtonPress}
                subtitleKey={subtitleKey}
                onLinkPress={onLinkPress}
            />
        </ScreenWrapper>
    );
}

NotFoundPage.displayName = 'NotFoundPage';

export default NotFoundPage;
