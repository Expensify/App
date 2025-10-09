import React, {useEffect, useState} from 'react';
import BlockingView from '@components/BlockingViews/BlockingView';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';

function SigningOutPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    // Load for half a second to avoid flashing the content if the sign out process is fast.
    // The half second loading delay is shown only once per sign out by using sessionStorage. It has to be tracked outside of the component because the component hierarchy will be completely
    // remounted when the user is signed out and the AuthScreens are replaced by the public screens.
    const [isLoading, setIsLoading] = useState(() => !sessionStorage.getItem('signingOutContentShown'));

    useEffect(() => {
        if (!isLoading) {
            return;
        }

        const timer = setTimeout(() => {
            setIsLoading(false);
            sessionStorage.setItem('signingOutContentShown', 'true');
        }, 500);

        return () => clearTimeout(timer);
    }, [isLoading]);

    if (isLoading) {
        return (
            <ScreenWrapper
                shouldEnableMaxHeight
                testID={SigningOutPage.displayName}
            >
                {null}
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            testID={SigningOutPage.displayName}
            shouldShowOfflineIndicator={false}
        >
            <BlockingView
                icon={Illustrations.FishingRod}
                iconWidth={variables.modalTopIconWidth}
                iconHeight={variables.modalTopIconHeight}
                title={translate('signingOutPage.title')}
                subtitle={translate('signingOutPage.subtitle')}
                subtitleStyle={[styles.textSupporting]}
            />
        </ScreenWrapper>
    );
}

SigningOutPage.displayName = 'SigningOutPage';

export default SigningOutPage;
