import React from 'react';
import {View} from 'react-native';
import {RESULTS} from 'react-native-permissions';
import AttachmentPicker from '@components/AttachmentPicker';
import Icon from '@components/Icon';
import ImageSVG from '@components/ImageSVG';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {FileObject} from '@src/types/utils/Attachment';

type ScannerControlsBarProps = {
    /** Whether the device is currently in landscape orientation */
    isInLandscapeMode: boolean;

    /** Whether multi-scan mode is currently active */
    isMultiScanEnabled: boolean;

    /** Whether the multi-scan feature is available */
    canUseMultiScan: boolean;

    /** Whether the attachment picker should allow selecting multiple files */
    shouldAcceptMultipleFiles: boolean;

    /** Current camera permission status from react-native-permissions */
    cameraPermissionStatus: string | null;

    /** Whether the camera flash is currently on */
    flash: boolean;

    /** Whether the camera device supports flash */
    hasFlash: boolean;

    /** Updater function to toggle flash state */
    setFlash: (updater: (prev: boolean) => boolean) => void;

    /** Sets whether the attachment picker modal is open */
    setIsAttachmentPickerActive: (value: boolean) => void;

    /** Sets visibility of the full-screen loading indicator */
    setIsLoaderVisible: (value: boolean) => void;

    /** Validates picked files and begins the receipt upload flow */
    validateFiles: (files: FileObject[], items?: DataTransferItem[]) => void;

    /** Triggers photo capture from the camera */
    capturePhoto: () => void;

    /** Toggles multi-scan mode on or off */
    toggleMultiScan: () => void;
};

function ScannerControlsBar({
    isInLandscapeMode,
    isMultiScanEnabled,
    canUseMultiScan,
    shouldAcceptMultipleFiles,
    cameraPermissionStatus,
    flash,
    hasFlash,
    setFlash,
    setIsAttachmentPickerActive,
    setIsLoaderVisible,
    validateFiles,
    capturePhoto,
    toggleMultiScan,
}: ScannerControlsBarProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const lazyIllustrations = useMemoizedLazyIllustrations(['Shutter']);
    const lazyIcons = useMemoizedLazyExpensifyIcons(['Bolt', 'Gallery', 'ReceiptMultiple', 'boltSlash']);

    return (
        <View style={[styles.justifyContentAround, styles.alignItemsCenter, styles.p3, !isInLandscapeMode && styles.flexRow]}>
            <AttachmentPicker
                onOpenPicker={() => {
                    setIsAttachmentPickerActive(true);
                    setIsLoaderVisible(true);
                }}
                fileLimit={shouldAcceptMultipleFiles ? CONST.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT : 1}
                shouldValidateImage={false}
            >
                {({openPicker}) => (
                    <PressableWithFeedback
                        role={CONST.ROLE.BUTTON}
                        accessibilityLabel={translate('receipt.gallery')}
                        sentryLabel={shouldAcceptMultipleFiles ? CONST.SENTRY_LABEL.REQUEST_STEP.SCAN.CHOOSE_FILES : CONST.SENTRY_LABEL.REQUEST_STEP.SCAN.CHOOSE_FILE}
                        style={[styles.alignItemsStart, isMultiScanEnabled && styles.opacity0]}
                        onPress={() => {
                            openPicker({
                                onPicked: (data) => validateFiles(data),
                                onCanceled: () => setIsLoaderVisible(false),
                                // makes sure the loader is not visible anymore e.g. when there is an error while uploading a file
                                onClosed: () => {
                                    setIsAttachmentPickerActive(false);
                                    setIsLoaderVisible(false);
                                },
                            });
                        }}
                    >
                        <Icon
                            height={variables.iconSizeMenuItem}
                            width={variables.iconSizeMenuItem}
                            src={lazyIcons.Gallery}
                            fill={theme.textSupporting}
                        />
                    </PressableWithFeedback>
                )}
            </AttachmentPicker>
            <PressableWithFeedback
                role={CONST.ROLE.BUTTON}
                accessibilityLabel={translate('receipt.shutter')}
                sentryLabel={CONST.SENTRY_LABEL.REQUEST_STEP.SCAN.SHUTTER}
                style={[styles.alignItemsCenter]}
                onPress={capturePhoto}
            >
                <ImageSVG
                    contentFit="contain"
                    src={lazyIllustrations.Shutter}
                    width={CONST.RECEIPT.SHUTTER_SIZE}
                    height={CONST.RECEIPT.SHUTTER_SIZE}
                />
            </PressableWithFeedback>
            {canUseMultiScan ? (
                <PressableWithFeedback
                    accessibilityRole="button"
                    role={CONST.ROLE.BUTTON}
                    accessibilityLabel={translate('receipt.multiScan')}
                    sentryLabel={CONST.SENTRY_LABEL.REQUEST_STEP.SCAN.MULTI_SCAN}
                    style={styles.alignItemsEnd}
                    onPress={toggleMultiScan}
                >
                    <Icon
                        height={variables.iconSizeMenuItem}
                        width={variables.iconSizeMenuItem}
                        src={lazyIcons.ReceiptMultiple}
                        fill={isMultiScanEnabled ? theme.iconMenu : theme.textSupporting}
                    />
                </PressableWithFeedback>
            ) : (
                <PressableWithFeedback
                    role={CONST.ROLE.BUTTON}
                    accessibilityLabel={translate('receipt.flash')}
                    sentryLabel={CONST.SENTRY_LABEL.REQUEST_STEP.SCAN.FLASH}
                    style={[styles.alignItemsEnd, !hasFlash && styles.opacity0]}
                    disabled={cameraPermissionStatus !== RESULTS.GRANTED || !hasFlash}
                    onPress={() => setFlash((prevFlash) => !prevFlash)}
                >
                    <Icon
                        height={variables.iconSizeMenuItem}
                        width={variables.iconSizeMenuItem}
                        src={flash ? lazyIcons.Bolt : lazyIcons.boltSlash}
                        fill={theme.textSupporting}
                    />
                </PressableWithFeedback>
            )}
        </View>
    );
}

export default ScannerControlsBar;
