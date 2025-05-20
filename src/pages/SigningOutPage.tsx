import React from 'react';
import BlockingView from '@components/BlockingViews/BlockingView';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';

function SigningOutPage() {
    const {translate} = useLocalize();

    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            testID={SigningOutPage.displayName}
        >
            <BlockingView
                icon={Illustrations.Mailbox}
                title={translate('signingOutPage.title')}
                subtitle={translate('signingOutPage.subtitle')}
                shouldShowLink={false}
            />
        </ScreenWrapper>
    );
}

SigningOutPage.displayName = 'SigningOutPage';

export default SigningOutPage;