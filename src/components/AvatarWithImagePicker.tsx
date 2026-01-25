import {useIsFocused} from '@react-navigation/native';
import React, {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePopoverPosition from '@hooks/usePopoverPosition';
import useThemeStyles from '@hooks/useThemeStyles';
import {validateAvatarImage} from '@libs/AvatarUtils';
import {isSafari} from '@libs/Browser';
import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import type {FileObject} from '@src/types/utils/Attachment';
import type IconAsset from '@src/types/utils/IconAsset';
import AttachmentPicker from './AttachmentPicker';
import AvatarButtonWithIcon from './AvatarButtonWithIcon';
import type {AvatarButtonWithIconProps} from './AvatarButtonWithIcon';
import AvatarCropModal from './AvatarCropModal/AvatarCropModal';
import DotIndicatorMessage from './DotIndicatorMessage';
import OfflineWithFeedback from './OfflineWithFeedback';
import PopoverMenu from './PopoverMenu';

type ErrorData = {
    validationError?: TranslationPaths | null | '';
    phraseParam: Record<string, unknown>;
};

type OpenPickerParams = {
    onPicked: (image: FileObject[]) => void;
};
type OpenPicker = (args: OpenPickerParams) => void;

type MenuItem = {
    icon: IconAsset;
    text: string;
    onSelected: () => void;
    shouldCallAfterModalHide?: boolean;
};

type AvatarWithImagePickerProps = Omit<AvatarButtonWithIconProps, 'text' | 'onPress' | 'anchorRef'> & {
    /** Additional style props */
    style?: StyleProp<ViewStyle>;

    /** Executed once an image has been selected */
    onImageSelected?: (file: File | CustomRNImageManipulatorResult) => void;

    /** Execute when the user taps "remove" */
    onImageRemoved?: () => void;

    /** Whether we are using the default avatar */
    isUsingDefaultAvatar?: boolean;

    /** Image crop vector mask */
    editorMaskImage?: IconAsset;

    /** Additional style object for the error row */
    errorRowStyles?: StyleProp<ViewStyle>;

    /** A function to run when the X button next to the error is clicked */
    onErrorClose?: () => void;

    /** The errors to display  */
    errors?: OnyxCommon.Errors | null;

    /** If set, the AvatarWithImagePicker will show a "View Photo" option and use this callback on press */
    onViewPhotoPress?: () => void;

    /** Allows to open an image without Attachment Picker. */
    enablePreview?: boolean;

    /** The name associated with avatar */
    name?: string;
};

const anchorAlignment = {horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.CENTER, vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP};

function AvatarWithImagePicker({
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
    fallbackIcon,
    size = CONST.AVATAR_SIZE.DEFAULT,
    type = CONST.ICON_TYPE_AVATAR,
    isUsingDefaultAvatar = false,
    onImageSelected = () => {},
    onImageRemoved = () => {},
    editorMaskImage,
    avatarStyle,
    disabled = false,
    onViewPhotoPress,
    enablePreview = false,
    editIcon,
    name = '',
}: AvatarWithImagePickerProps) {
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar', 'Pencil', 'Upload', 'Eye', 'Trashcan'] as const);
    const styles = useThemeStyles();
    const isFocused = useIsFocused();
    const [popoverPosition, setPopoverPosition] = useState({horizontal: 0, vertical: 0});
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [errorData, setErrorData] = useState<ErrorData>({validationError: null, phraseParam: {}});
    const [isAvatarCropModalOpen, setIsAvatarCropModalOpen] = useState(false);
    const [imageData, setImageData] = useState({
        uri: '',
        name: '',
        type: '',
    });
    const {calculatePopoverPosition} = usePopoverPosition();
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
     * Validates an image and opens avatar crop modal if valid
     */
    const showAvatarCropModal = useCallback((image: FileObject) => {
        validateAvatarImage(image)
            .then((validationResult) => {
                if (!validationResult.isValid) {
                    setError(validationResult.errorKey ?? null, validationResult.errorParams ?? {});
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
    }, []);

    const hideAvatarCropModal = () => {
        setIsAvatarCropModalOpen(false);
    };

    /**
     * Create menu items list for avatar menu
     */
    const createMenuItems = (openPicker: OpenPicker): MenuItem[] => {
        const menuItems: MenuItem[] = [
            {
                icon: icons.Upload,
                text: translate('avatarWithImagePicker.uploadPhoto'),
                onSelected: () => {
                    if (isSafari()) {
                        return;
                    }
                    openPicker({
                        onPicked: (data) => showAvatarCropModal(data.at(0) ?? {}),
                    });
                },
                shouldCallAfterModalHide: true,
            },
        ];

        // If current avatar isn't a default avatar, allow Remove Photo option
        if (!isUsingDefaultAvatar) {
            menuItems.push({
                icon: icons.Trashcan,
                text: translate('avatarWithImagePicker.removePhoto'),
                onSelected: () => {
                    setError(null, {});
                    onImageRemoved();
                },
            });
        }
        return menuItems;
    };

    const onPressAvatar = useCallback(
        (openPicker: OpenPicker) => {
            anchorRef.current?.blur();
            if (disabled && enablePreview && onViewPhotoPress) {
                onViewPhotoPress();
                return;
            }
            if (isUsingDefaultAvatar) {
                openPicker({
                    onPicked: (data) => showAvatarCropModal(data.at(0) ?? {}),
                });
                return;
            }
            setIsMenuVisible((prev) => !prev);
        },
        [disabled, enablePreview, isUsingDefaultAvatar, onViewPhotoPress, showAvatarCropModal],
    );

    useLayoutEffect(() => {
        if (!anchorRef.current || !isMenuVisible) {
            return;
        }

        calculatePopoverPosition(anchorRef, anchorAlignment).then(setPopoverPosition);
    }, [calculatePopoverPosition, isMenuVisible]);

    return (
        <View style={[styles.w100, style]}>
            <View style={styles.w100}>
                <AttachmentPicker
                    type={CONST.ATTACHMENT_PICKER_TYPE.IMAGE}
                    // We need to skip the validation in AttachmentPicker because it is handled in this component itself
                    shouldValidateImage={false}
                >
                    {({openPicker}) => {
                        const menuItems = createMenuItems(openPicker);

                        // If the current avatar isn't a default avatar and we are not overriding this behavior allow the "View Photo" option
                        if (onViewPhotoPress && !isUsingDefaultAvatar) {
                            menuItems.push({
                                icon: icons.Eye,
                                text: translate('avatarWithImagePicker.viewPhoto'),
                                onSelected: onViewPhotoPress,
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
                                    <AvatarButtonWithIcon
                                        text={translate('avatarWithImagePicker.editImage')}
                                        source={source}
                                        avatarID={avatarID}
                                        onPress={() => onPressAvatar(openPicker)}
                                        avatarStyle={avatarStyle}
                                        pendingAction={pendingAction}
                                        fallbackIcon={fallbackIcon ?? icons.FallbackAvatar}
                                        anchorRef={anchorRef}
                                        DefaultAvatar={DefaultAvatar}
                                        editIcon={editIcon ?? icons.Pencil}
                                        size={size}
                                        type={type}
                                        disabled={disabled}
                                        disabledStyle={disabledStyle}
                                        editIconStyle={editIconStyle}
                                        name={name}
                                    />
                                </OfflineWithFeedback>
                                <PopoverMenu
                                    anchorPosition={popoverPosition}
                                    isVisible={isMenuVisible}
                                    onClose={() => setIsMenuVisible(false)}
                                    onItemSelected={(item, index) => {
                                        setIsMenuVisible(false);
                                        // In order for the file picker to open dynamically, the click
                                        // function must be called from within an event handler that was initiated
                                        // by the user on Safari.
                                        if (index === 0 && isSafari()) {
                                            openPicker({
                                                onPicked: (data) => showAvatarCropModal(data.at(0) ?? {}),
                                            });
                                        }
                                    }}
                                    menuItems={menuItems}
                                    anchorAlignment={anchorAlignment}
                                    anchorRef={anchorRef}
                                />
                            </>
                        );
                    }}
                </AttachmentPicker>
            </View>
            {!!errorData.validationError && (
                <DotIndicatorMessage
                    style={styles.mt6}
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

export default AvatarWithImagePicker;
