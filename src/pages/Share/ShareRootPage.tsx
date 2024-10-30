import React, {useCallback, useEffect, useRef, useState} from 'react';
import {AppState, View} from 'react-native';
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
import type {TempShareFile} from '@src/types/onyx';
import ShareTab from './ShareTab';
import SubmitTab from './SubmitTab';

function ShareRootPage() {
    const appState = useRef(AppState.currentState);

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isFileScannable, setIsFileScannable] = useState(false);
    const imageFileFormats = Object.values(CONST.IMAGE_FILE_FORMAT) as string[];

    const handleProcessFiles = useCallback(() => {
        setIsFileScannable(false);
        ShareActionHandlerModule.processFiles((processedFiles) => {
            const tempFile = Array.isArray(processedFiles) ? processedFiles.at(0) : (JSON.parse(processedFiles) as TempShareFile);

            if (tempFile) {
                if (tempFile.mimeType && imageFileFormats.includes(tempFile.mimeType)) {
                    setIsFileScannable(true);
                }

                ShareActions.addTempShareFile(tempFile);
            }
        });
    }, [imageFileFormats]);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                handleProcessFiles();
            }

            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, [handleProcessFiles]);

    useEffect(() => {
        handleProcessFiles();
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

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
                    tabBar={TabSelector}
                >
                    <TopTab.Screen name={CONST.TAB.SHARE.SHARE}>{() => <ShareTab />}</TopTab.Screen>
                    {isFileScannable && <TopTab.Screen name={CONST.TAB.SHARE.SUBMIT}>{() => <SubmitTab />}</TopTab.Screen>}
                </OnyxTabNavigator>
            </View>
        </ScreenWrapper>
    );
}

ShareRootPage.displayName = 'ShareRootPage';

export default ShareRootPage;
