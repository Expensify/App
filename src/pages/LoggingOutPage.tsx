import React, {useEffect, useState} from 'react';
import BlockingView from '@components/BlockingViews/BlockingView';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useOnyx from '@hooks/useOnyx';
import * as Session from '@libs/actions/Session';
import ONYXKEYS from '@src/ONYXKEYS';
import variables from '@styles/variables';

function LoggingOutPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [isLoggingOutContentShown] = useOnyx(ONYXKEYS.IS_LOGGING_OUT_CONTENT_SHOWN);

    // Load for half a second to avoid flashing the content if the sign out process is fast.
    // The half second loading delay is shown only once per sign out by using Onyx. It has to be tracked outside of the component because the component hierarchy will be completely
    // remounted when the user is signed out and the AuthScreens are replaced by the public screens.
    const [isLoading, setIsLoading] = useState(() => !isLoggingOutContentShown);

    useEffect(() => {
        if (!isLoading) {
            return;
        }

        const timer = setTimeout(() => {
            setIsLoading(false);
            Session.setLoggingOutContentShown(true);
        }, 500);

        return () => clearTimeout(timer);
    }, [isLoading]);

    if (isLoading) {
        return (
            <ScreenWrapper
                shouldEnableMaxHeight
                testID={LoggingOutPage.displayName}
            >
                {null}
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            testID={LoggingOutPage.displayName}
        >
            <BlockingView
                icon={Illustrations.Encryption}
                iconWidth={variables.modalTopIconWidth}
                iconHeight={variables.modalTopIconHeight}
                title={translate('loggingOutPage.title')}
                subtitle={translate('loggingOutPage.subtitle')}
                subtitleStyle={[styles.textSupporting]}
                shouldShowLink={false}
            />
        </ScreenWrapper>
    );
}

LoggingOutPage.displayName = 'LoggingOutPage';

export default LoggingOutPage;
