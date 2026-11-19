import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TabNavigatorSkeleton from '@components/Skeletons/TabNavigatorSkeleton';
import TabSelector from '@components/TabSelector/TabSelector';

import useFilesValidation from '@hooks/useFilesValidation';
import useLocalize from '@hooks/useLocalize';
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
import ROUTES from '@src/ROUTES';
import type {ShareTempFile} from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';

import React, {useEffect, useRef, useState} from 'react';
import {Alert, Linking, View} from 'react-native';

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
    const {validateFiles} = useFilesValidation(addValidatedShareFile);

    const validateFileIfNecessary = (file: ShareTempFile, isOutdatedRead: () => boolean) => {
        if (!file || !shouldValidateFile(file)) {
            return;
        }

        getFileSize(file.content)
            .catch((error: unknown) => {
                Log.warn('[ShareRootPage] Failed to get file size for validation', {error});
                return undefined;
            })
            .then((size) => {
                if (isOutdatedRead()) {
                    return;
                }
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

    // Native reads run concurrently and can finish in any order, so only the most recent read may update the screen, and none may once it unmounts.
    const latestShareReadIDRef = useRef(0);
    const [isFileReady, setIsFileReady] = useState(false);

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isFileScannable, setIsFileScannable] = useState(false);
    const receiptFileFormats = Object.values(CONST.RECEIPT_ALLOWED_FILE_TYPES) as string[];
    const shareFileMimeTypes = Object.values(CONST.SHARE_FILE_MIMETYPE) as string[];
    const [errorTitle, setErrorTitle] = useState<string | undefined>(undefined);
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (!errorTitle || !errorMessage) {
            return;
        }

        showErrorAlert(errorTitle, errorMessage);
    }, [errorTitle, errorMessage]);

    const handleProcessFiles = () => {
        latestShareReadIDRef.current += 1;
        const shareReadID = latestShareReadIDRef.current;
        const isOutdatedRead = () => shareReadID !== latestShareReadIDRef.current;

        ShareActionHandler.processFiles()
            .then((sharedFiles) => {
                const tempFile = sharedFiles.at(0);
                if (errorTitle || isOutdatedRead()) {
                    return;
                }
                if (!tempFile) {
                    setErrorTitle(translate('attachmentPicker.attachmentError'));
                    setErrorMessage(translate('attachmentView.attachmentNotFound'));
                    return;
                }
                if (!shareFileMimeTypes.includes(tempFile.mimeType)) {
                    setErrorTitle(translate('attachmentPicker.wrongFileType'));
                    setErrorMessage(translate('attachmentPicker.notAllowedExtension'));
                    return;
                }

                const isImage = /image\/.*/.test(tempFile.mimeType);
                if (tempFile.mimeType !== CONST.SHARE_FILE_MIMETYPE.TXT && !isImage) {
                    getFileSize(tempFile.content)
                        .then((size) => {
                            if (isOutdatedRead()) {
                                return;
                            }
                            if (size > CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE) {
                                setErrorTitle(translate('attachmentPicker.attachmentTooLarge'));
                                setErrorMessage(translate('attachmentPicker.sizeExceeded'));
                            }

                            if (size < CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE) {
                                setErrorTitle(translate('attachmentPicker.attachmentTooSmall'));
                                setErrorMessage(translate('attachmentPicker.sizeNotMet'));
                            }
                        })
                        .catch((error: unknown) => {
                            Log.warn('[ShareRootPage] Failed to get the shared file size', {error});
                        });
                }

                // Skip the standalone corruption check for files that go through `validateFileIfNecessary`,
                // because `validateFiles` already runs corruption checks internally. Running both would
                // surface a duplicate (and potentially misleading) "corrupt attachment" alert.
                if (isImage && !shouldValidateFile(tempFile)) {
                    const fileObject: FileObject = {name: tempFile.id, uri: tempFile.content, type: tempFile.mimeType};
                    validateImageForCorruption(fileObject).catch(() => {
                        if (isOutdatedRead()) {
                            return;
                        }
                        setErrorTitle(translate('attachmentPicker.attachmentError'));
                        setErrorMessage(translate('attachmentPicker.errorWhileSelectingCorruptedAttachment'));
                    });
                }

                const {fileExtension} = splitExtensionFromFileName(tempFile.content);
                if (receiptFileFormats.includes(tempFile.mimeType) && fileExtension) {
                    setIsFileScannable(true);
                    // Reset the persisted tab to SUBMIT so that defaultSelectedTab takes effect
                    // even when a previous Share session left the tab on SHARE.
                    Tab.setSelectedTab(CONST.TAB.SHARE.NAVIGATOR_ID, CONST.TAB.SHARE.SUBMIT);
                } else {
                    setIsFileScannable(false);
                }
                validateFileIfNecessary(tempFile, isOutdatedRead);
                setIsFileReady(true);
                addTempShareFile(tempFile);
            })
            .catch((error: unknown) => {
                Log.warn('[ShareRootPage] Failed to process the shared files', {error});
                if (errorTitle || isOutdatedRead()) {
                    return;
                }
                setErrorTitle(translate('attachmentPicker.attachmentError'));
                setErrorMessage(translate('attachmentView.attachmentNotFound'));
            });
    };

    useEffect(() => {
        // Re-read only on a new share. Foreground events also fire after permission dialogs, when the file may already be moved.
        const subscription = Linking.addEventListener('url', ({url}) => {
            if (!url.includes(ROUTES.SHARE_ROOT)) {
                return;
            }

            handleProcessFiles();
        });

        return () => {
            subscription.remove();
        };
    }, [handleProcessFiles]);

    useEffect(() => {
        clearShareData();
        handleProcessFiles();

        return () => {
            latestShareReadIDRef.current += 1;
        };
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
