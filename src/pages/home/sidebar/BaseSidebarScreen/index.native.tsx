import React, {useEffect} from 'react';
import ScreenWrapper from '@components/ScreenWrapper';
import useThemeStyles from '@hooks/useThemeStyles';
import Performance from '@libs/Performance';
import SidebarInboxContent from '@pages/home/sidebar/SidebarInboxContent';
import CONST from '@src/CONST';

function BaseSidebarScreen() {
    const styles = useThemeStyles();

    useEffect(() => {
        Performance.markStart(CONST.TIMING.SIDEBAR_LOADED);
    }, []);

    return (
        <ScreenWrapper
            shouldEnableKeyboardAvoidingView={false}
            style={[styles.sidebar, styles.userSelectNone]}
            testID={BaseSidebarScreen.displayName}
        >
            {({insets}) => (
                <SidebarInboxContent
                    shouldUseNarrowLayout
                    insets={insets}
                />
            )}
        </ScreenWrapper>
    );
}

BaseSidebarScreen.displayName = 'BaseSidebarScreen';

export default BaseSidebarScreen;
