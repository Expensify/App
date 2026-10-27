import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TabNavigatorSkeleton from '@components/Skeletons/TabNavigatorSkeleton';
import TabSelector from '@components/TabSelector/TabSelector';

import useFilesValidation from '@hooks/useFilesValidation';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {addTempShareFile, addValidatedShareFile, clearShareData} from '@libs/actions/Share';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import {splitExtensionFromFileName, validateImageForCorruption} from '@libs/fileDownload/FileUtils';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import OnyxTabNavigator, {TopTab} from '@libs/Navigation/OnyxTabNavigator';
import {shouldValidateFile} from '@libs/ReceiptUtils';
import ShareActionHandler from '@libs/ShareActionHandlerModule';

import {close as closeModal} from '@userActions/Modal';
import Tab from '@userActions/Tab';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ShareTempFile} from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';

import React, {useEffect, useRef, useState} from 'react';
import {Alert, AppState, View} from 'react-native';

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
    const [currentAttachment] = useOnyx(ONYXKEYS.SHARE_TEMP_FILE);

    const {validateFiles} = useFilesValidation(addValidatedShareFile);
    const isTextShared = currentAttachment?.mimeType === 'txt';

    const validateFileIfNecessary = (file: ShareTempFile) => {
        if (!file || isTextShared || !shouldValidateFile(file)) {
            return;
        }

        getFileSize(file.content)
            .catch((error: unknown) => {
                Log.warn('[ShareRootPage] Failed to get file size for validation', {error});
                return undefined;
            })
            .then((size) => {
                validateFiles(
                    [
                        {
                            name: file.id,
                            uri: file.content,
                            type: file.mimeType,
                            size,
                        },
                    ],
                    undefined,
                    {isValidatingReceipts: false},
                );
            });
    };

    const appState = useRef(AppState.currentState);
    const [isFileReady, setIsFileReady] = useState(false);

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isFileScannable, setIsFileScannable] = useState(false);
    const receiptFileFormats = Object.values(CONST.RECEIPT_ALLOWED_FILE_TYPES) as string[];
    const shareFileMimeTypes = Object.values(CONST.SHARE_FILE_MIMETYPE) as string[];
    const [errorTitle, setErrorTitle] = useState<string | undefined>(undefined);
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
    const errorTitleRef = useRef<string | undefined>(undefined);

    const setShareError = (title: string, message: string) => {
        if (errorTitleRef.current) {
            return;
        }

        errorTitleRef.current = title;
        setErrorTitle(title);
        setErrorMessage(message);
    };

    useEffect(() => {
        if (!errorTitle || !errorMessage) {
            return;
        }

        showErrorAlert(errorTitle, errorMessage);
    }, [errorTitle, errorMessage]);

    const handleProcessFiles = () => {
        ShareActionHandler.processFiles()
            .then((processedFiles: ShareTempFile[]) => {
                if (errorTitleRef.current) {
                    return;
                }
                const tempFile = processedFiles.at(0);
                if (!tempFile) {
                    if (isFileReady) {
                        return;
                    }
                    setShareError(translate('attachmentPicker.attachmentError'), translate('attachmentView.attachmentNotFound'));
                    return;
                }
                if (!tempFile.mimeType || !shareFileMimeTypes.includes(tempFile.mimeType)) {
                    setShareError(translate('attachmentPicker.wrongFileType'), translate('attachmentPicker.notAllowedExtension'));
                    return;
                }

                const {mimeType} = tempFile;
                const isImage = /image\/.*/.test(mimeType);
                if (mimeType !== 'txt' && !isImage) {
                    getFileSize(tempFile.content).then((size) => {
                        if (size > CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE) {
                            setShareError(translate('attachmentPicker.attachmentTooLarge'), translate('attachmentPicker.sizeExceeded'));
                        }

                        if (size < CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE) {
                            setShareError(translate('attachmentPicker.attachmentTooSmall'), translate('attachmentPicker.sizeNotMet'));
                        }
                    });
                }

                // Skip the standalone corruption check for files that go through `validateFileIfNecessary`,
                // because `validateFiles` already runs corruption checks internally. Running both would
                // surface a duplicate (and potentially misleading) "corrupt attachment" alert.
                if (isImage && !shouldValidateFile(tempFile)) {
                    const fileObject: FileObject = {name: tempFile.id, uri: tempFile.content, type: mimeType};
                    validateImageForCorruption(fileObject).catch(() => {
                        setShareError(translate('attachmentPicker.attachmentError'), translate('attachmentPicker.errorWhileSelectingCorruptedAttachment'));
                    });
                }

                const {fileExtension} = splitExtensionFromFileName(tempFile.content);
                if (receiptFileFormats.includes(mimeType) && fileExtension) {
                    setIsFileScannable(true);
                    // Reset the persisted tab to SUBMIT so that defaultSelectedTab takes effect
                    // even when a previous Share session left the tab on SHARE.
                    Tab.setSelectedTab(CONST.TAB.SHARE.NAVIGATOR_ID, CONST.TAB.SHARE.SUBMIT);
                } else {
                    setIsFileScannable(false);
                }
                validateFileIfNecessary(tempFile);
                setIsFileReady(true);
                addTempShareFile(tempFile);
            })
            .catch((error: unknown) => {
                Log.warn('[ShareRootPage] Failed to process shared files', {error});
                setShareError(translate('attachmentPicker.attachmentError'), translate('attachmentPicker.errorWhileSelectingCorruptedAttachment'));
            });
    };

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        closeModal();
    }, []);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            shouldEnableMinHeight={canUseTouchScreen()}
            testID="ShareRootPage"
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
                        defaultSelectedTab={isFileScannable ? CONST.TAB.SHARE.SUBMIT : CONST.TAB.SHARE.SHARE}
                        lazyLoadEnabled
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

export default ShareRootPage;

export {showErrorAlert};
