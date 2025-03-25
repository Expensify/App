import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Alert, AppState, View} from 'react-native';
import type {FileObject} from '@components/AttachmentModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TabNavigatorSkeleton from '@components/Skeletons/TabNavigatorSkeleton';
import TabSelector from '@components/TabSelector/TabSelector';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {addTempShareFile, clearShareData} from '@libs/actions/Share';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import {splitExtensionFromFileName, validateImageForCorruption} from '@libs/fileDownload/FileUtils';
import Navigation from '@libs/Navigation/Navigation';
import OnyxTabNavigator, {TopTab} from '@libs/Navigation/OnyxTabNavigator';
import ShareActionHandler from '@libs/ShareActionHandlerModule';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {ShareTempFile} from '@src/types/onyx';
import ShareTab from './ShareTab';
import SubmitTab from './SubmitTab';

function showErrorAlert(title: string, message: string) {
    Alert.alert(title, message, [
        {
            onPress: () => {
                Navigation.navigate(ROUTES.HOME);
            },
        },
    ]);
    Navigation.navigate(ROUTES.HOME);
}

function ShareRootPage() {
    const appState = useRef(AppState.currentState);
    const [isFileReady, setIsFileReady] = useState(false);

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isFileScannable, setIsFileScannable] = useState(false);
    const receiptFileFormats = Object.values(CONST.RECEIPT_ALLOWED_FILE_TYPES) as string[];
    const shareFileMimetypes = Object.values(CONST.SHARE_FILE_MIMETYPE) as string[];

    const handleProcessFiles = useCallback(() => {
        ShareActionHandler.processFiles((processedFiles) => {
            const tempFile = Array.isArray(processedFiles) ? processedFiles.at(0) : (JSON.parse(processedFiles) as ShareTempFile);
            if (!tempFile?.mimeType || !shareFileMimetypes.includes(tempFile?.mimeType)) {
                showErrorAlert(translate('attachmentPicker.wrongFileType'), translate('attachmentPicker.notAllowedExtension'));
                return;
            }

            const fileRegexp = /image\/.*/;
            if (fileRegexp.test(tempFile?.mimeType)) {
                const fileObject: FileObject = {name: tempFile.id, uri: tempFile?.content, type: tempFile?.mimeType};
                validateImageForCorruption(fileObject)
                    .then(() => {
                        if (fileObject.size && fileObject.size > CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE) {
                            showErrorAlert(translate('attachmentPicker.attachmentTooLarge'), translate('attachmentPicker.sizeExceeded'));
                        }

                        if (fileObject.size && fileObject.size < CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE) {
                            showErrorAlert(translate('attachmentPicker.attachmentTooSmall'), translate('attachmentPicker.sizeNotMet'));
                        }

                        return true;
                    })
                    .catch(() => {
                        showErrorAlert(translate('attachmentPicker.attachmentError'), translate('attachmentPicker.errorWhileSelectingCorruptedAttachment'));
                    });
            }

            const {fileExtension} = splitExtensionFromFileName(tempFile?.content);
            if (tempFile) {
                if (tempFile.mimeType) {
                    if (receiptFileFormats.includes(tempFile.mimeType) && fileExtension) {
                        setIsFileScannable(true);
                    } else {
                        setIsFileScannable(false);
                    }
                    setIsFileReady(true);
                }

                addTempShareFile(tempFile);
            }
        });
    }, [receiptFileFormats, shareFileMimetypes, translate]);

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
                    onBackButtonPress={() => Navigation.navigate(ROUTES.HOME)}
                />
                {isFileReady ? (
                    <OnyxTabNavigator
                        id={CONST.TAB.SHARE.NAVIGATOR_ID}
                        tabBar={TabSelector}
                    >
                        <TopTab.Screen name={CONST.TAB.SHARE.SHARE}>{() => <ShareTab />}</TopTab.Screen>
                        {isFileScannable && <TopTab.Screen name={CONST.TAB.SHARE.SUBMIT}>{() => <SubmitTab />}</TopTab.Screen>}
                    </OnyxTabNavigator>
                ) : (
                    <TabNavigatorSkeleton />
                )}
            </View>
        </ScreenWrapper>
    );
}

ShareRootPage.displayName = 'ShareRootPage';

export default ShareRootPage;

export {showErrorAlert};
