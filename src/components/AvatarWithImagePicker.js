import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import _ from 'underscore';
import useLocalize from '@hooks/useLocalize';
import * as Browser from '@libs/Browser';
import * as FileUtils from '@libs/fileDownload/FileUtils';
import getImageResolution from '@libs/fileDownload/getImageResolution';
import stylePropTypes from '@styles/stylePropTypes';
import styles from '@styles/styles';
import themeColors from '@styles/themes/default';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import AttachmentModal from './AttachmentModal';
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

const propTypes = {
    /** Avatar source to display */
    source: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),

    /** Additional style props */
    style: stylePropTypes,

    /** Executed once an image has been selected */
    onImageSelected: PropTypes.func,

    /** Execute when the user taps "remove" */
    onImageRemoved: PropTypes.func,

    /** A default avatar component to display when there is no source */
    DefaultAvatar: PropTypes.func,

    /** Whether we are using the default avatar */
    isUsingDefaultAvatar: PropTypes.bool,

    /** The anchor position of the menu */
    anchorPosition: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }).isRequired,

    /** Size of Indicator */
    size: PropTypes.oneOf([CONST.AVATAR_SIZE.LARGE, CONST.AVATAR_SIZE.DEFAULT]),

    /** A fallback avatar icon to display when there is an error on loading avatar from remote URL. */
    fallbackIcon: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),

    /** Denotes whether it is an avatar or a workspace avatar */
    type: PropTypes.oneOf([CONST.ICON_TYPE_AVATAR, CONST.ICON_TYPE_WORKSPACE]),

    /** Image crop vector mask */
    editorMaskImage: PropTypes.func,

    /** Additional style object for the error row */
    errorRowStyles: stylePropTypes,

    /** A function to run when the X button next to the error is clicked */
    onErrorClose: PropTypes.func,

    /** The type of action that's pending  */
    pendingAction: PropTypes.oneOf(['add', 'update', 'delete']),

    /** The errors to display  */
    // eslint-disable-next-line react/forbid-prop-types
    errors: PropTypes.object,

    /** Title for avatar preview modal */
    headerTitle: PropTypes.string,

    /** Avatar source for avatar preview modal */
    previewSource: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),

    /** File name of the avatar */
    originalFileName: PropTypes.string,

    /** Whether navigation is focused */
    isFocused: PropTypes.bool.isRequired,

    /** Where the popover should be positioned relative to the anchor points. */
    anchorAlignment: PropTypes.shape({
        horizontal: PropTypes.oneOf(_.values(CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL)),
        vertical: PropTypes.oneOf(_.values(CONST.MODAL.ANCHOR_ORIGIN_VERTICAL)),
    }),
};

const defaultProps = {
    source: '',
    onImageSelected: () => {},
    onImageRemoved: () => {},
    style: [],
    DefaultAvatar: () => {},
    isUsingDefaultAvatar: false,
    size: CONST.AVATAR_SIZE.DEFAULT,
    fallbackIcon: Expensicons.FallbackAvatar,
    type: CONST.ICON_TYPE_AVATAR,
    editorMaskImage: undefined,
    errorRowStyles: [],
    onErrorClose: () => {},
    pendingAction: null,
    errors: null,
    headerTitle: '',
    previewSource: '',
    originalFileName: '',
    anchorAlignment: {
        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
    },
};

function AvatarWithImagePicker({
    isFocused,
    DefaultAvatar,
    style,
    pendingAction,
    errors,
    errorRowStyles,
    onErrorClose,
    source,
    fallbackIcon,
    size,
    type,
    headerTitle,
    previewSource,
    originalFileName,
    isUsingDefaultAvatar,
    onImageRemoved,
    anchorPosition,
    anchorAlignment,
    onImageSelected,
    editorMaskImage,
}) {
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [errorData, setErrorData] = useState({
        validationError: null,
        phraseParam: {},
    });
    const [isAvatarCropModalOpen, setIsAvatarCropModalOpen] = useState(false);
    const [imageData, setImageData] = useState({
        uri: '',
        name: '',
        type: '',
    });
    const anchorRef = useRef();
    const {translate} = useLocalize();

    /**
     * @param {String} error
     * @param {Object} phraseParam
     */
    const setError = (error, phraseParam) => {
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

    /**
     * Check if the attachment extension is allowed.
     *
     * @param {Object} image
     * @returns {Boolean}
     */
    const isValidExtension = (image) => {
        const {fileExtension} = FileUtils.splitExtensionFromFileName(lodashGet(image, 'name', ''));
        return _.contains(CONST.AVATAR_ALLOWED_EXTENSIONS, fileExtension.toLowerCase());
    };

    /**
     * Check if the attachment size is less than allowed size.
     *
     * @param {Object} image
     * @returns {Boolean}
     */
    const isValidSize = (image) => image && lodashGet(image, 'size', 0) < CONST.AVATAR_MAX_ATTACHMENT_SIZE;

    /**
     * Check if the attachment resolution matches constraints.
     *
     * @param {Object} image
     * @returns {Promise}
     */
    const isValidResolution = (image) =>
        getImageResolution(image).then(
            ({height, width}) => height >= CONST.AVATAR_MIN_HEIGHT_PX && width >= CONST.AVATAR_MIN_WIDTH_PX && height <= CONST.AVATAR_MAX_HEIGHT_PX && width <= CONST.AVATAR_MAX_WIDTH_PX,
        );

    /**
     * Validates if an image has a valid resolution and opens an avatar crop modal
     *
     * @param {Object} image
     */
    const showAvatarCropModal = (image) => {
        if (!isValidExtension(image)) {
            setError('avatarWithImagePicker.notAllowedExtension', {allowedExtensions: CONST.AVATAR_ALLOWED_EXTENSIONS});
            return;
        }
        if (!isValidSize(image)) {
            setError('avatarWithImagePicker.sizeExceeded', {maxUploadSizeInMB: CONST.AVATAR_MAX_ATTACHMENT_SIZE / (1024 * 1024)});
            return;
        }

        isValidResolution(image).then((isValid) => {
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
                uri: image.uri,
                name: image.name,
                type: image.type,
            });
        });
    };

    const hideAvatarCropModal = () => {
        setIsAvatarCropModalOpen(false);
    };

    /**
     * Create menu items list for avatar menu
     *
     * @param {Function} openPicker
     * @returns {Array}
     */
    const createMenuItems = (openPicker) => {
        const menuItems = [
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

    return (
        <View style={StyleSheet.flatten([styles.alignItemsCenter, style])}>
            <View style={[styles.pRelative, styles.avatarLarge]}>
                <OfflineWithFeedback
                    pendingAction={pendingAction}
                    errors={errors}
                    errorRowStyles={errorRowStyles}
                    onClose={onErrorClose}
                >
                    <Tooltip text={translate('avatarWithImagePicker.editImage')}>
                        <PressableWithoutFeedback
                            onPress={() => setIsMenuVisible((prev) => !prev)}
                            role={CONST.ACCESSIBILITY_ROLE.IMAGEBUTTON}
                            accessibilityLabel={translate('avatarWithImagePicker.editImage')}
                            disabled={isAvatarCropModalOpen}
                            ref={anchorRef}
                        >
                            <View>
                                {source ? (
                                    <Avatar
                                        containerStyles={styles.avatarLarge}
                                        imageStyles={[styles.avatarLarge, styles.alignSelfCenter]}
                                        source={source}
                                        fallbackIcon={fallbackIcon}
                                        size={size}
                                        type={type}
                                    />
                                ) : (
                                    <DefaultAvatar />
                                )}
                            </View>
                            <View style={[styles.smallEditIcon, styles.smallAvatarEditIcon]}>
                                <Icon
                                    src={Expensicons.Camera}
                                    width={variables.iconSizeSmall}
                                    height={variables.iconSizeSmall}
                                    fill={themeColors.textLight}
                                />
                            </View>
                        </PressableWithoutFeedback>
                    </Tooltip>
                </OfflineWithFeedback>
                <AttachmentModal
                    headerTitle={headerTitle}
                    source={previewSource}
                    originalFileName={originalFileName}
                    fallbackSource={fallbackIcon}
                >
                    {({show}) => (
                        <AttachmentPicker type={CONST.ATTACHMENT_PICKER_TYPE.IMAGE}>
                            {({openPicker}) => {
                                const menuItems = createMenuItems(openPicker);

                                // If the current avatar isn't a default avatar, allow the "View Photo" option
                                if (!isUsingDefaultAvatar) {
                                    menuItems.push({
                                        icon: Expensicons.Eye,
                                        text: translate('avatarWithImagePicker.viewPhoto'),
                                        onSelected: show,
                                    });
                                }

                                return (
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
                                        anchorPosition={anchorPosition}
                                        withoutOverlay
                                        anchorRef={anchorRef}
                                        anchorAlignment={anchorAlignment}
                                    />
                                );
                            }}
                        </AttachmentPicker>
                    )}
                </AttachmentModal>
            </View>
            {errorData.validationError && (
                <DotIndicatorMessage
                    style={[styles.mt6]}
                    messages={{0: translate(errorData.validationError, errorData.phraseParam)}}
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

AvatarWithImagePicker.propTypes = propTypes;
AvatarWithImagePicker.defaultProps = defaultProps;
AvatarWithImagePicker.displayName = 'AvatarWithImagePicker';

export default withNavigationFocus(AvatarWithImagePicker);
