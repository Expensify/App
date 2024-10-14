import React, {useEffect} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TabSelector from '@components/TabSelector/TabSelector';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import OnyxTabNavigator, {TopTab} from '@libs/Navigation/OnyxTabNavigator';
import * as ShareActions from '@userActions/Share';
import CONST from '@src/CONST';
import ShareActionHandlerModule from '@src/modules/ShareActionHandlerModule';
import ShareTab from './ShareTab';
import SubmitTab from './SubmitTab';

function ShareRootPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const handleProcessFiles = () => {
        ShareActionHandlerModule.processFiles((processedFiles) => {
            // eslint-disable-next-line no-console
            const tempFile = processedFiles.at(0);
            console.log('processedFiles', processedFiles);
            if (tempFile) {
                ShareActions.addTempShareFile({...tempFile});
            }
        });
    };

    useEffect(() => {
        handleProcessFiles();
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fileIsScannable = true;

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableKeyboardAvoidingView={false}
            shouldEnableMinHeight={DeviceCapabilities.canUseTouchScreen()}
            testID={ShareRootPage.displayName}
        >
            <View style={[styles.flex1]}>
                <HeaderWithBackButton
                    title={translate('share.shareToExpensify')}
                    shouldShowBackButton
                />
                <OnyxTabNavigator
                    id={CONST.TAB.SHARE.NAVIGATOR_ID}
                    // @ts-expect-error I think that OnyxTabNavigator is going to be refactored in terms of types
                    // selectedTab={fileIsScannable && selectedTab ? selectedTab : CONST.TAB.SHARE}
                    hideTabBar={!fileIsScannable}
                    tabBar={TabSelector}
                >
                    <TopTab.Screen name={CONST.TAB.SHARE.SHARE}>{() => <ShareTab />}</TopTab.Screen>
                    <TopTab.Screen name={CONST.TAB.SHARE.SUBMIT}>{() => <SubmitTab />}</TopTab.Screen>
                </OnyxTabNavigator>
            </View>
        </ScreenWrapper>
    );
}

ShareRootPage.displayName = 'ShareRootPage';

export default ShareRootPage;
