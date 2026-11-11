import AttachmentPicker from '@components/AttachmentPicker';
import Icon from '@components/Icon';
import ImageSVG from '@components/ImageSVG';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';

import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {FileObject} from '@src/types/utils/Attachment';
import type {SentryLabel} from '@src/types/utils/SentryLabel';

import React from 'react';
import {View} from 'react-native';
import {RESULTS} from 'react-native-permissions';

type ScannerControlsBarProps = {
    /** Whether the device is currently in landscape orientation */
    isInLandscapeMode: boolean;

    /** Whether multi-scan mode is currently active */
    isMultiScanEnabled?: boolean;

    /** Whether the multi-scan feature is available */
    canUseMultiScan?: boolean;

    /** Whether the attachment picker should allow selecting multiple files */
    shouldAcceptMultipleFiles?: boolean;

    /** Current camera permission status from react-native-permissions */
    cameraPermissionStatus: string | null;

    /** Whether the camera flash is currently on */
    flash?: boolean;

    /** Whether the camera device supports flash */
    hasFlash?: boolean;

    /** Updater function to toggle flash state. When omitted the flash button is replaced by a same-sized spacer that keeps the shutter centered */
    setFlash?: (updater: (prev: boolean) => boolean) => void;

    /** Sets whether the attachment picker modal is open */
    setIsAttachmentPickerActive: (value: boolean) => void;

    /** Notifies the consumer when the attachment picker opens or closes */
    onAttachmentPickerStatusChange?: (isOpen: boolean) => void;

    /** Called when files are selected from the gallery picker */
    onPicked: (files: FileObject[], items?: DataTransferItem[]) => void;

    /** Triggers photo capture from the camera */
    capturePhoto: () => void;

    /** Toggles multi-scan mode on or off */
    toggleMultiScan?: () => void;

    isReceiptEnhancementEnabled?: boolean;

    /** Turns receipt enhancements on or off. When omitted the bar has no enhancement button and flash stays after the shutter */
    toggleReceiptEnhancement?: () => void;

    /** Sentry label for the gallery button. Defaults to the scan labels */
    gallerySentryLabel?: SentryLabel;

    /** Sentry label for the shutter button. Defaults to the scan label */
    shutterSentryLabel?: SentryLabel;
};

function ScannerControlsBar({
    isInLandscapeMode,
    isMultiScanEnabled = false,
    canUseMultiScan = false,
    shouldAcceptMultipleFiles = false,
    cameraPermissionStatus,
    flash = false,
    hasFlash = false,
    setFlash,
    setIsAttachmentPickerActive,
    onAttachmentPickerStatusChange,
    onPicked,
    capturePhoto,
    toggleMultiScan,
    isReceiptEnhancementEnabled = false,
    toggleReceiptEnhancement,
    gallerySentryLabel,
    shutterSentryLabel = CONST.SENTRY_LABEL.REQUEST_STEP.SCAN.SHUTTER,
}: ScannerControlsBarProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const lazyIllustrations = useMemoizedLazyIllustrations(['Shutter']);
    const lazyIcons = useMemoizedLazyExpensifyIcons(['Bolt', 'Gallery', 'ReceiptMultiple', 'Sparkles', 'boltSlash']);
    const hasReceiptEnhancementButton = !!toggleReceiptEnhancement;

    // Empty View matching the gallery icon size so justifyContentAround keeps the shutter exactly centered
    const spacer = <View style={StyleUtils.getWidthAndHeightStyle(variables.iconSizeMenuItem)} />;

    const flashButton = setFlash ? (
        <PressableWithFeedback
            role={CONST.ROLE.BUTTON}
            accessibilityLabel={translate('receipt.flash')}
            sentryLabel={CONST.SENTRY_LABEL.REQUEST_STEP.SCAN.FLASH}
            style={[hasReceiptEnhancementButton ? styles.alignItemsCenter : styles.alignItemsEnd, !hasFlash && styles.opacity0]}
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
    ) : (
        spacer
    );

    return (
        <View style={[styles.justifyContentAround, styles.alignItemsCenter, styles.p3, !isInLandscapeMode && styles.flexRow]}>
            <AttachmentPicker
                onOpenPicker={() => {
                    setIsAttachmentPickerActive(true);
                    onAttachmentPickerStatusChange?.(true);
                }}
                fileLimit={shouldAcceptMultipleFiles ? CONST.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT : 1}
                shouldValidateImage={false}
            >
                {({openPicker}) => (
                    <PressableWithFeedback
                        role={CONST.ROLE.BUTTON}
                        accessibilityLabel={translate('receipt.gallery')}
                        sentryLabel={gallerySentryLabel ?? (shouldAcceptMultipleFiles ? CONST.SENTRY_LABEL.REQUEST_STEP.SCAN.CHOOSE_FILES : CONST.SENTRY_LABEL.REQUEST_STEP.SCAN.CHOOSE_FILE)}
                        style={[styles.alignItemsStart, isMultiScanEnabled && styles.opacity0]}
                        onPress={() =>
                            openPicker({
                                onPicked,
                                onCanceled: () => onAttachmentPickerStatusChange?.(false),
                                onClosed: () => {
                                    setIsAttachmentPickerActive(false);
                                    onAttachmentPickerStatusChange?.(false);
                                },
                            })
                        }
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
            {hasReceiptEnhancementButton && flashButton}
            <PressableWithFeedback
                role={CONST.ROLE.BUTTON}
                accessibilityLabel={translate('receipt.shutter')}
                sentryLabel={shutterSentryLabel}
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
            {hasReceiptEnhancementButton && (
                <PressableWithFeedback
                    role={CONST.ROLE.SWITCH}
                    aria-checked={isReceiptEnhancementEnabled}
                    accessibilityLabel={translate('receipt.receiptEnhancements')}
                    sentryLabel={CONST.SENTRY_LABEL.REQUEST_STEP.SCAN.RECEIPT_ENHANCEMENT}
                    style={[styles.alignItemsCenter, isMultiScanEnabled && styles.opacity0]}
                    disabled={isMultiScanEnabled}
                    accessible={!isMultiScanEnabled}
                    aria-hidden={isMultiScanEnabled}
                    onPress={toggleReceiptEnhancement}
                >
                    <Icon
                        height={variables.iconSizeMenuItem}
                        width={variables.iconSizeMenuItem}
                        src={lazyIcons.Sparkles}
                        fill={isReceiptEnhancementEnabled ? theme.iconSuccessFill : theme.textSupporting}
                    />
                </PressableWithFeedback>
            )}
            {canUseMultiScan && (
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
            )}
            {!canUseMultiScan && (hasReceiptEnhancementButton ? spacer : flashButton)}
        </View>
    );
}

export default ScannerControlsBar;
