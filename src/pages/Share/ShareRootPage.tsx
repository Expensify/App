import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Alert, AppState, View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TabSelector from '@components/TabSelector/TabSelector';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {addTempShareFile, clearShareData} from '@libs/actions/Share';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import OnyxTabNavigator, {TopTab} from '@libs/Navigation/OnyxTabNavigator';
import ShareActionHandler from '@libs/ShareActionHandlerModule';
import CONST from '@src/CONST';
import type {ShareTempFile} from '@src/types/onyx';
import ShareTab from './ShareTab';
import SubmitTab from './SubmitTab';

function ShareRootPage() {
    const appState = useRef(AppState.currentState);

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isFileScannable, setIsFileScannable] = useState(false);
    const imageFileFormats = Object.values(CONST.IMAGE_FILE_FORMAT) as string[];
    const shareFileMimetypes = Object.values(CONST.SHARE_FILE_MIMETYPE) as string[];

    const handleProcessFiles = useCallback(() => {
        ShareActionHandler.processFiles((processedFiles) => {
            const tempFile = Array.isArray(processedFiles) ? processedFiles.at(0) : (JSON.parse(processedFiles) as ShareTempFile);
            if (!tempFile?.mimeType || !shareFileMimetypes.includes(tempFile?.mimeType)) {
                Alert.alert(translate('attachmentPicker.wrongFileType'), translate('attachmentPicker.notAllowedExtension'), [
                    {
                        onPress: () => {
                            Navigation.navigate('');
                        },
                    },
                ]);
            }
            if (tempFile) {
                if (tempFile.mimeType) {
                    if (imageFileFormats.includes(tempFile.mimeType)) {
                        setIsFileScannable(true);
                    } else {
                        setIsFileScannable(false);
                    }
                }

                addTempShareFile(tempFile);
            }
        });
    }, [imageFileFormats, shareFileMimetypes, translate]);

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
        clearShareData();
        handleProcessFiles();
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableKeyboardAvoidingView={false}
            shouldEnableMinHeight={canUseTouchScreen()}
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
