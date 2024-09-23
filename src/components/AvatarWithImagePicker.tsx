import React, {useCallback, useEffect, useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import type {ImageStyle, StyleProp, ViewStyle} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as Browser from '@libs/Browser';
import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';
import * as FileUtils from '@libs/fileDownload/FileUtils';
import getImageResolution from '@libs/fileDownload/getImageResolution';
import type {AvatarSource} from '@libs/UserUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import type IconAsset from '@src/types/utils/IconAsset';
import AttachmentModal from './AttachmentModal';
import type {FileObject} from './AttachmentModal';
import AttachmentPicker from './AttachmentPicker';
import Avatar from './Avatar';
import AvatarCropModal from './AvatarCropModal/AvatarCropModal';
import DotIndicatorMessage from './DotIndicatorMessage';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import OfflineWithFeedback from './OfflineWithFeedback';
import PopoverMenu from './PopoverMenu';
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';
import Tooltip from './Tooltip';
import withNavigationFocus from './withNavigationFocus';

type ErrorData = {
    validationError?: TranslationPaths | null | '';
    phraseParam: Record<string, unknown>;
};

type OpenPickerParams = {
    onPicked: (image: FileObject) => void;
};
type OpenPicker = (args: OpenPickerParams) => void;

type MenuItem = {
    icon: IconAsset;
    text: string;
    onSelected: () => void;
    shouldCallAfterModalHide?: boolean;
};

type AvatarWithImagePickerProps = {
    /** Avatar source to display */
    source?: AvatarSource;

    /** Account id of user for which avatar is displayed  */
    avatarID?: number | string;

    /** Additional style props */
    style?: StyleProp<ViewStyle>;

    /** Additional style props for disabled picker */
    disabledStyle?: StyleProp<ViewStyle>;

    /** Additional style props for the edit icon */
    editIconStyle?: StyleProp<ViewStyle>;

    /** Executed once an image has been selected */
    onImageSelected?: (file: File | CustomRNImageManipulatorResult) => void;

    /** Execute when the user taps "remove" */
    onImageRemoved?: () => void;

    /** A default avatar component to display when there is no source */
    DefaultAvatar?: () => React.ReactNode;

    /** Whether we are using the default avatar */
    isUsingDefaultAvatar?: boolean;

    /** Size of Indicator */
    size?: typeof CONST.AVATAR_SIZE.XLARGE | typeof CONST.AVATAR_SIZE.LARGE | typeof CONST.AVATAR_SIZE.DEFAULT;

    /** A fallback avatar icon to display when there is an error on loading avatar from remote URL. */
    fallbackIcon?: AvatarSource;

    /** Denotes whether it is an avatar or a workspace avatar */
    type?: typeof CONST.ICON_TYPE_AVATAR | typeof CONST.ICON_TYPE_WORKSPACE;

    /** Image crop vector mask */
    editorMaskImage?: IconAsset;

    /** Additional style object for the error row */
    errorRowStyles?: StyleProp<ViewStyle>;

    /** A function to run when the X button next to the error is clicked */
    onErrorClose?: () => void;

    /** The type of action that's pending  */
    pendingAction?: OnyxCommon.PendingAction;

    /** The errors to display  */
    errors?: OnyxCommon.Errors | null;

    /** Title for avatar preview modal */
    headerTitle?: string;

    /** Avatar source for avatar preview modal */
    previewSource?: AvatarSource;

    /** File name of the avatar */
    originalFileName?: string;

    /** Whether navigation is focused */
    isFocused: boolean;

    /** Style applied to the avatar */
    avatarStyle: StyleProp<ViewStyle & ImageStyle>;

    /** Indicates if picker feature should be disabled */
    disabled?: boolean;

    /** Executed once click on view photo option */
    onViewPhotoPress?: () => void;

    /** Allows to open an image without Attachment Picker. */
    enablePreview?: boolean;

    /** Hard disables the "View photo" option */
    shouldDisableViewPhoto?: boolean;

    /** Optionally override the default "Edit" icon */
    editIcon?: IconAsset;

    /** Determines if a style utility function should be used for calculating the PopoverMenu anchor position. */
    shouldUseStyleUtilityForAnchorPosition?: boolean;
};

function AvatarWithImagePicker({
    isFocused,
    DefaultAvatar = () => null,
    style,
    disabledStyle,
    editIconStyle,
    pendingAction,
    errors,
    errorRowStyles,
    onErrorClose = () => {},
    source = '',
    avatarID,
    fallbackIcon = Expensicons.FallbackAvatar,
    size = CONST.AVATAR_SIZE.DEFAULT,
    type = CONST.ICON_TYPE_AVATAR,
    headerTitle = '',
    previewSource = '',
    originalFileName = '',
    isUsingDefaultAvatar = false,
    onImageSelected = () => {},
    onImageRemoved = () => {},
    editorMaskImage,
    avatarStyle,
    disabled = false,
    onViewPhotoPress,
    enablePreview = false,
    shouldDisableViewPhoto = false,
    editIcon = Expensicons.Pencil,
    shouldUseStyleUtilityForAnchorPosition = false,
}: AvatarWithImagePickerProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {windowWidth} = useWindowDimensions();
    const [popoverPosition, setPopoverPosition] = useState({horizontal: 0, vertical: 0});
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [errorData, setErrorData] = useState<ErrorData>({validationError: null, phraseParam: {}});
    const [isAvatarCropModalOpen, setIsAvatarCropModalOpen] = useState(false);
    const [imageData, setImageData] = useState({
        uri: '',
        name: '',
        type: '',
    });
    const anchorRef = useRef<View>(null);
    const {translate} = useLocalize();

    const setError = (error: TranslationPaths | null, phraseParam: Record<string, unknown>) => {
        setErrorData({
            validationError: error,
            phraseParam,
        });
    };

    useEffect(() => {
        if (isFocused) {
            return;
        }

        // Reset the error if the component is no longer focused.
        setError(null, {});
    }, [isFocused]);

    useEffect(() => {
        setError(null, {});
    }, [source, avatarID]);

    /**
     * Check if the attachment extension is allowed.
     */
    const isValidExtension = useCallback((image: FileObject): boolean => {
        const {fileExtension} = FileUtils.splitExtensionFromFileName(image?.name ?? '');
        return CONST.AVATAR_ALLOWED_EXTENSIONS.some((extension) => extension === fileExtension.toLowerCase());
    }, []);

    /**
     * Check if the attachment size is less than allowed size.
     */
    const isValidSize = useCallback((image: FileObject): boolean => (image?.size ?? 0) < CONST.AVATAR_MAX_ATTACHMENT_SIZE, []);

    /**
     * Check if the attachment resolution matches constraints.
     */
    const isValidResolution = (image: FileObject): Promise<boolean> =>
        getImageResolution(image).then(
            ({height, width}) => height >= CONST.AVATAR_MIN_HEIGHT_PX && width >= CONST.AVATAR_MIN_WIDTH_PX && height <= CONST.AVATAR_MAX_HEIGHT_PX && width <= CONST.AVATAR_MAX_WIDTH_PX,
        );

    /**
     * Validates if an image has a valid resolution and opens an avatar crop modal
     */
    const showAvatarCropModal = useCallback(
        (image: FileObject) => {
            if (!isValidExtension(image)) {
                setError('avatarWithImagePicker.notAllowedExtension', {allowedExtensions: CONST.AVATAR_ALLOWED_EXTENSIONS});
                return;
            }
            if (!isValidSize(image)) {
                setError('avatarWithImagePicker.sizeExceeded', {maxUploadSizeInMB: CONST.AVATAR_MAX_ATTACHMENT_SIZE / (1024 * 1024)});
                return;
            }

            FileUtils.validateImageForCorruption(image)
                .then(() => isValidResolution(image))
                .then((isValid) => {
                    if (!isValid) {
                        setError('avatarWithImagePicker.resolutionConstraints', {
                            minHeightInPx: CONST.AVATAR_MIN_HEIGHT_PX,
                            minWidthInPx: CONST.AVATAR_MIN_WIDTH_PX,
                            maxHeightInPx: CONST.AVATAR_MAX_HEIGHT_PX,
                            maxWidthInPx: CONST.AVATAR_MAX_WIDTH_PX,
                        });
                        return;
                    }

                    setIsAvatarCropModalOpen(true);
                    setError(null, {});
                    setIsMenuVisible(false);
                    setImageData({
                        uri: image.uri ?? '',
                        name: image.name ?? '',
                        type: image.type ?? '',
                    });
                })
                .catch(() => {
                    setError('attachmentPicker.errorWhileSelectingCorruptedAttachment', {});
                });
        },
        [isValidExtension, isValidSize],
    );

    const hideAvatarCropModal = () => {
        setIsAvatarCropModalOpen(false);
    };

    /**
     * Create menu items list for avatar menu
     */
    const createMenuItems = (openPicker: OpenPicker): MenuItem[] => {
        const menuItems: MenuItem[] = [
            {
                icon: Expensicons.Upload,
                text: translate('avatarWithImagePicker.uploadPhoto'),
                onSelected: () => {
                    if (Browser.isSafari()) {
                        return;
                    }
                    openPicker({
                        onPicked: showAvatarCropModal,
                    });
                },
                shouldCallAfterModalHide: true,
            },
        ];

        // If current avatar isn't a default avatar, allow Remove Photo option
        if (!isUsingDefaultAvatar) {
            menuItems.push({
                icon: Expensicons.Trashcan,
                text: translate('avatarWithImagePicker.removePhoto'),
                onSelected: () => {
                    setError(null, {});
                    onImageRemoved();
                },
            });
        }
        return menuItems;
    };

    useEffect(() => {
        if (!anchorRef.current) {
            return;
        }

        if (!isMenuVisible) {
            return;
        }

        anchorRef.current.measureInWindow((x, y, width, height) => {
            setPopoverPosition({
                horizontal: x + (width - variables.photoUploadPopoverWidth) / 2,
                vertical: y + height + variables.spacing2,
            });
        });
    }, [isMenuVisible, windowWidth]);

    const onPressAvatar = useCallback(
        (openPicker: OpenPicker) => {
            if (disabled && enablePreview && onViewPhotoPress) {
                onViewPhotoPress();
                return;
            }
            if (isUsingDefaultAvatar) {
                openPicker({
                    onPicked: showAvatarCropModal,
                });
                return;
            }
            setIsMenuVisible((prev) => !prev);
        },
        [disabled, enablePreview, isUsingDefaultAvatar, onViewPhotoPress, showAvatarCropModal],
    );

    return (
        <View style={[styles.w100, style]}>
            <View style={styles.w100}>
                <AttachmentModal
                    headerTitle={headerTitle}
                    source={previewSource}
                    originalFileName={originalFileName}
                    fallbackSource={fallbackIcon}
                    maybeIcon={isUsingDefaultAvatar}
                >
                    {({show}) => (
                        <AttachmentPicker
                            type={CONST.ATTACHMENT_PICKER_TYPE.IMAGE}
                            shouldValidateImage={false}
                        >
                            {({openPicker}) => {
                                const menuItems = createMenuItems(openPicker);

                                // If the current avatar isn't a default avatar and we are not overriding this behavior allow the "View Photo" option
                                if (!shouldDisableViewPhoto && !isUsingDefaultAvatar) {
                                    menuItems.push({
                                        icon: Expensicons.Eye,
                                        text: translate('avatarWithImagePicker.viewPhoto'),
                                        onSelected: () => {
                                            if (typeof onViewPhotoPress !== 'function') {
                                                show();
                                                return;
                                            }
                                            onViewPhotoPress();
                                        },
                                        shouldCallAfterModalHide: true,
                                    });
                                }

                                return (
                                    <>
                                        <OfflineWithFeedback
                                            errors={errors}
                                            errorRowStyles={errorRowStyles}
                                            onClose={onErrorClose}
                                        >
                                            <Tooltip
                                                shouldRender={!disabled}
                                                text={translate('avatarWithImagePicker.editImage')}
                                            >
                                                <PressableWithoutFeedback
                                                    onPress={() => onPressAvatar(openPicker)}
                                                    accessibilityRole={CONST.ROLE.BUTTON}
                                                    accessibilityLabel={translate('avatarWithImagePicker.editImage')}
                                                    disabled={isAvatarCropModalOpen || (disabled && !enablePreview)}
                                                    disabledStyle={disabledStyle}
                                                    style={[styles.pRelative, type === CONST.ICON_TYPE_AVATAR && styles.alignSelfCenter, avatarStyle]}
                                                    ref={anchorRef}
                                                >
                                                    <OfflineWithFeedback pendingAction={pendingAction}>
                                                        {source ? (
                                                            <Avatar
                                                                containerStyles={avatarStyle}
                                                                imageStyles={[styles.alignSelfCenter, avatarStyle]}
                                                                source={source}
                                                                avatarID={avatarID}
                                                                fallbackIcon={fallbackIcon}
                                                                size={size}
                                                                type={type}
                                                            />
                                                        ) : (
                                                            <DefaultAvatar />
                                                        )}
                                                    </OfflineWithFeedback>
                                                    {!disabled && (
                                                        <View style={StyleSheet.flatten([styles.smallEditIcon, styles.smallAvatarEditIcon, editIconStyle])}>
                                                            <Icon
                                                                src={editIcon}
                                                                width={variables.iconSizeSmall}
                                                                height={variables.iconSizeSmall}
                                                                fill={theme.icon}
                                                            />
                                                        </View>
                                                    )}
                                                </PressableWithoutFeedback>
                                            </Tooltip>
                                        </OfflineWithFeedback>
                                        <PopoverMenu
                                            isVisible={isMenuVisible}
                                            onClose={() => setIsMenuVisible(false)}
                                            onItemSelected={(item, index) => {
                                                setIsMenuVisible(false);
                                                // In order for the file picker to open dynamically, the click
                                                // function must be called from within an event handler that was initiated
                                                // by the user on Safari.
                                                if (index === 0 && Browser.isSafari()) {
                                                    openPicker({
                                                        onPicked: showAvatarCropModal,
                                                    });
                                                }
                                            }}
                                            menuItems={menuItems}
                                            anchorPosition={shouldUseStyleUtilityForAnchorPosition ? styles.popoverMenuOffset(windowWidth) : popoverPosition}
                                            anchorAlignment={{horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT, vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP}}
                                            withoutOverlay
                                            anchorRef={anchorRef}
                                        />
                                    </>
                                );
                            }}
                        </AttachmentPicker>
                    )}
                </AttachmentModal>
            </View>
            {errorData.validationError && (
                <DotIndicatorMessage
                    style={[styles.mt6]}
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    messages={{0: translate(errorData.validationError, errorData.phraseParam as never)}}
                    type="error"
                />
            )}
            <AvatarCropModal
                onClose={hideAvatarCropModal}
                isVisible={isAvatarCropModalOpen}
                onSave={onImageSelected}
                imageUri={imageData.uri}
                imageName={imageData.name}
                imageType={imageData.type}
                maskImage={editorMaskImage}
            />
        </View>
    );
}

AvatarWithImagePicker.displayName = 'AvatarWithImagePicker';

export default withNavigationFocus(AvatarWithImagePicker);
