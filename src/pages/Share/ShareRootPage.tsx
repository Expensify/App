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
import getFileSize from './getFileSize';
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
    const [errorTitle, setErrorTitle] = useState<string | undefined>(undefined);
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (!errorTitle || !errorMessage) {
            return;
        }

        showErrorAlert(errorTitle, errorMessage);
    }, [errorTitle, errorMessage]);

    const handleProcessFiles = useCallback(() => {
        ShareActionHandler.processFiles((processedFiles) => {
            const tempFile = Array.isArray(processedFiles) ? processedFiles.at(0) : (JSON.parse(processedFiles) as ShareTempFile);
            if (errorTitle) {
                return;
            }
            if (!tempFile?.mimeType || !shareFileMimetypes.includes(tempFile?.mimeType)) {
                setErrorTitle(translate('attachmentPicker.wrongFileType'));
                setErrorMessage(translate('attachmentPicker.notAllowedExtension'));
                return;
            }

            const isImage = /image\/.*/.test(tempFile?.mimeType);
            if (tempFile?.mimeType && tempFile?.mimeType !== 'txt' && !isImage) {
                getFileSize(tempFile?.content).then((size) => {
                    if (size > CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE) {
                        setErrorTitle(translate('attachmentPicker.attachmentTooLarge'));
                        setErrorMessage(translate('attachmentPicker.sizeExceeded'));
                    }

                    if (size < CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE) {
                        setErrorTitle(translate('attachmentPicker.attachmentTooSmall'));
                        setErrorMessage(translate('attachmentPicker.sizeNotMet'));
                    }
                });
            }

            if (isImage) {
                const fileObject: FileObject = {name: tempFile.id, uri: tempFile?.content, type: tempFile?.mimeType};
                validateImageForCorruption(fileObject).catch(() => {
                    setErrorTitle(translate('attachmentPicker.attachmentError'));
                    setErrorMessage(translate('attachmentPicker.errorWhileSelectingCorruptedAttachment'));
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
    }, [receiptFileFormats, shareFileMimetypes, translate, errorTitle]);

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
