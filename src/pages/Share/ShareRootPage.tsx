import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Alert, AppState, InteractionManager, View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
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
import Navigation from '@libs/Navigation/Navigation';
import OnyxTabNavigator, {TopTab} from '@libs/Navigation/OnyxTabNavigator';
import {shouldValidateFile} from '@libs/ReceiptUtils';
import ShareActionHandler from '@libs/ShareActionHandlerModule';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ShareTempFile} from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';
import getFileSize from './getFileSize';
import ShareTab from './ShareTab';
import SubmitTab from './SubmitTab';

function showErrorAlert(title: string, message: string) {
    Alert.alert(title, message, [
        {
            onPress: () => {
                Navigation.navigate(ROUTES.INBOX);
            },
        },
    ]);
    Navigation.navigate(ROUTES.INBOX);
}

function ShareRootPage() {
    const [currentAttachment] = useOnyx(ONYXKEYS.SHARE_TEMP_FILE, {canBeMissing: true});

    const {validateFiles} = useFilesValidation(addValidatedShareFile);
    const isTextShared = currentAttachment?.mimeType === 'txt';

    const validateFileIfNecessary = useCallback(
        (file: ShareTempFile) => {
            if (!file || isTextShared || !shouldValidateFile(file)) {
                return;
            }

            validateFiles([
                {
                    name: file.id,
                    uri: file.content,
                    type: file.mimeType,
                },
            ]);
        },
        [isTextShared, validateFiles],
    );

    const appState = useRef(AppState.currentState);
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

    const handleProcessFiles = useCallback(() => {
        ShareActionHandler.processFiles((processedFiles) => {
            const tempFile = Array.isArray(processedFiles) ? processedFiles.at(0) : (JSON.parse(processedFiles) as ShareTempFile);
            if (errorTitle) {
                return;
            }
            if (!tempFile?.mimeType || !shareFileMimeTypes.includes(tempFile?.mimeType)) {
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
                    validateFileIfNecessary(tempFile);
                    setIsFileReady(true);
                }

                addTempShareFile(tempFile);
            }
        });
    }, [errorTitle, shareFileMimeTypes, translate, receiptFileFormats, validateFileIfNecessary]);

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

    const shareTabInputRef = useRef<AnimatedTextInputRef | null>(null);
    const submitTabInputRef = useRef<AnimatedTextInputRef | null>(null);

    // We're focusing the input using internal onPageSelected to fix input focus inconsistencies on native.
    // More info: https://github.com/Expensify/App/issues/59388
    const onTabSelectFocusHandler = ({index}: {index: number}) => {
        // We runAfterInteractions since the function is called in the animate block on web-based
        // implementation, this fixes an animation glitch and matches the native internal delay
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            // Chat tab (0) / Room tab (1) according to OnyxTabNavigator (see below)
            if (index === 0) {
                shareTabInputRef.current?.focus();
            } else if (index === 1) {
                submitTabInputRef.current?.focus();
            }
        });
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableKeyboardAvoidingView={false}
            shouldEnableMinHeight={canUseTouchScreen()}
            testID="ShareRootPage"
        >
            <View style={[styles.flex1]}>
                <HeaderWithBackButton
                    title={translate('share.shareToExpensify')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.navigate(ROUTES.INBOX)}
                />
                {isFileReady ? (
                    <OnyxTabNavigator
                        id={CONST.TAB.SHARE.NAVIGATOR_ID}
                        tabBar={TabSelector}
                        lazyLoadEnabled
                        onTabSelect={onTabSelectFocusHandler}
                    >
                        <TopTab.Screen name={CONST.TAB.SHARE.SHARE}>{() => <ShareTab ref={shareTabInputRef} />}</TopTab.Screen>
                        {isFileScannable && <TopTab.Screen name={CONST.TAB.SHARE.SUBMIT}>{() => <SubmitTab ref={submitTabInputRef} />}</TopTab.Screen>}
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
