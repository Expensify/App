import React, {useEffect} from 'react';
import {View} from 'react-native';
import TopBar from '@components/Navigation/TopBar';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Performance from '@libs/Performance';
import CONST from '@src/CONST';
import SidebarLinksData from './SidebarLinksData';

function BaseSidebarScreen() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

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
                <>
                    <TopBar
                        breadcrumbLabel={translate('common.inbox')}
                        shouldDisplaySearch
                        shouldDisplayHelpButton
                    />
                    <View style={[styles.flex1]}>
                        <SidebarLinksData insets={insets} />
                    </View>
                </>
            )}
        </ScreenWrapper>
    );
}

BaseSidebarScreen.displayName = 'BaseSidebarScreen';

export default BaseSidebarScreen;
