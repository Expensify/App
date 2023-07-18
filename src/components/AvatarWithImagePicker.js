import _ from 'underscore';
import React, {useCallback, useState} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import Avatar from './Avatar';
import Icon from './Icon';
import PopoverMenu from './PopoverMenu';
import * as Expensicons from './Icon/Expensicons';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import AttachmentPicker from './AttachmentPicker';
import ConfirmModal from './ConfirmModal';
import AvatarCropModal from './AvatarCropModal/AvatarCropModal';
import OfflineWithFeedback from './OfflineWithFeedback';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import variables from '../styles/variables';
import CONST from '../CONST';
// import SpinningIndicatorAnimation from '../styles/animation/SpinningIndicatorAnimation';
import Tooltip from './Tooltip';
import stylePropTypes from '../styles/stylePropTypes';
import * as FileUtils from '../libs/fileDownload/FileUtils';
import getImageResolution from '../libs/fileDownload/getImageResolution';
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';

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

    /** Flag to see if image is being uploaded */
    // isUploading: PropTypes.bool,

    /** Size of Indicator */
    size: PropTypes.oneOf([CONST.AVATAR_SIZE.LARGE, CONST.AVATAR_SIZE.DEFAULT]),

    /** A fallback avatar icon to display when there is an error on loading avatar from remote URL. */
    fallbackIcon: PropTypes.func,

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

    ...withLocalizePropTypes,
};

const defaultProps = {
    source: '',
    onImageSelected: () => {},
    onImageRemoved: () => {},
    style: [],
    DefaultAvatar: () => {},
    isUsingDefaultAvatar: false,
    // isUploading: false,
    size: CONST.AVATAR_SIZE.DEFAULT,
    fallbackIcon: Expensicons.FallbackAvatar,
    type: CONST.ICON_TYPE_AVATAR,
    editorMaskImage: undefined,
    errorRowStyles: [],
    onErrorClose: () => {},
    pendingAction: null,
    errors: null,
};

function AvatarWithImagePicker(props) {
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
    const [errorModalPrompt, setErrorModalPrompt] = useState('');
    const [errorModalTitle, setErrorModalTitle] = useState('');
    const [isAvatarCropModalOpen, setIsAvatarCropModalOpen] = useState(false);
    const [imageName, setImageName] = useState('');
    const [imageUri, setImageUri] = useState('');
    const [imageType, setImageType] = useState('');

    const DefaultAvatar = props.DefaultAvatar;
    const additionalStyles = _.isArray(props.style) ? props.style : [props.style];

    /**
     * @param {String} title
     * @param {String} prompt
     */
    function showErrorModal(title, prompt) {
        setIsErrorModalVisible(true);
        setErrorModalTitle(title);
        setErrorModalPrompt(prompt);
    }

    const hideErrorModal = useCallback(() => {
        setIsErrorModalVisible(false);
    }, []);
    /**
     * Check if the attachment extension is allowed.
     *
     * @param {Object} image
     * @returns {Boolean}
     */
    function isValidExtension(image) {
        const {fileExtension} = FileUtils.splitExtensionFromFileName(lodashGet(image, 'name', ''));
        return _.contains(CONST.AVATAR_ALLOWED_EXTENSIONS, fileExtension.toLowerCase());
    }

    /**
     * Check if the attachment size is less than allowed size.
     *
     * @param {Object} image
     * @returns {Boolean}
     */
    function isValidSize(image) {
        return image && lodashGet(image, 'size', 0) < CONST.AVATAR_MAX_ATTACHMENT_SIZE;
    }

    /**
     * Check if the attachment resolution matches constraints.
     *
     * @param {Object} image
     * @returns {Promise}
     */
    function isValidResolution(image) {
        return getImageResolution(image).then(
            (resolution) =>
                resolution.height >= CONST.AVATAR_MIN_HEIGHT_PX &&
                resolution.width >= CONST.AVATAR_MIN_WIDTH_PX &&
                resolution.height <= CONST.AVATAR_MAX_HEIGHT_PX &&
                resolution.width <= CONST.AVATAR_MAX_WIDTH_PX,
        );
    }

    /**
     * Validates if an image has a valid resolution and opens an avatar crop modal
     *
     * @param {Object} image
     */
    function showAvatarCropModal(image) {
        if (!isValidExtension(image)) {
            showErrorModal(
                props.translate('avatarWithImagePicker.imageUploadFailed'),
                props.translate('avatarWithImagePicker.notAllowedExtension', {allowedExtensions: CONST.AVATAR_ALLOWED_EXTENSIONS}),
            );
            return;
        }
        if (!isValidSize(image)) {
            showErrorModal(
                props.translate('avatarWithImagePicker.imageUploadFailed'),
                props.translate('avatarWithImagePicker.sizeExceeded', {maxUploadSizeInMB: CONST.AVATAR_MAX_ATTACHMENT_SIZE / (1024 * 1024)}),
            );
            return;
        }

        isValidResolution(image).then((isValid) => {
            if (!isValid) {
                showErrorModal(
                    props.translate('avatarWithImagePicker.imageUploadFailed'),
                    props.translate('avatarWithImagePicker.resolutionConstraints', {
                        minHeightInPx: CONST.AVATAR_MIN_HEIGHT_PX,
                        minWidthInPx: CONST.AVATAR_MIN_WIDTH_PX,
                        maxHeightInPx: CONST.AVATAR_MAX_HEIGHT_PX,
                        maxWidthInPx: CONST.AVATAR_MAX_WIDTH_PX,
                    }),
                );
                return;
            }

            setIsAvatarCropModalOpen(true);
            setImageUri(image.uri);
            setImageName(image.name);
            setImageType(image.type);
        });
    }

    const hideAvatarCropModal = useCallback(() => {
        setIsAvatarCropModalOpen(false);
    }, []);

    /**
     * Create menu items list for avatar menu
     *
     * @param {Function} openPicker
     * @returns {Array}
     */
    function createMenuItems(openPicker) {
        const menuItems = [
            {
                icon: Expensicons.Upload,
                text: props.translate('avatarWithImagePicker.uploadPhoto'),
                onSelected: () => {
                    openPicker({
                        onPicked: showAvatarCropModal,
                    });
                },
            },
        ];

        // If current avatar isn't a default avatar, allow Remove Photo option
        if (!props.isUsingDefaultAvatar) {
            menuItems.push({
                icon: Expensicons.Trashcan,
                text: props.translate('avatarWithImagePicker.removePhoto'),
                onSelected: () => {
                    props.onImageRemoved();
                },
            });
        }
        return menuItems;
    }

    return (
        <View style={[styles.alignItemsCenter, ...additionalStyles]}>
            <PressableWithoutFeedback
                onPress={() => setIsMenuVisible(true)}
                accessibilityRole={CONST.ACCESSIBILITY_ROLE.IMAGEBUTTON}
                accessibilityLabel={props.translate('avatarWithImagePicker.editImage')}
            >
                <View style={[styles.pRelative, styles.avatarLarge]}>
                    <OfflineWithFeedback
                        pendingAction={props.pendingAction}
                        errors={props.errors}
                        errorRowStyles={props.errorRowStyles}
                        onClose={props.onErrorClose}
                    >
                        <Tooltip text={props.translate('avatarWithImagePicker.editImage')}>
                            <View>
                                {props.source ? (
                                    <Avatar
                                        containerStyles={styles.avatarLarge}
                                        imageStyles={[styles.avatarLarge, styles.alignSelfCenter]}
                                        source={props.source}
                                        fallbackIcon={props.fallbackIcon}
                                        size={props.size}
                                        type={props.type}
                                    />
                                ) : (
                                    <DefaultAvatar />
                                )}
                            </View>
                        </Tooltip>
                    </OfflineWithFeedback>

                    <AttachmentPicker type={CONST.ATTACHMENT_PICKER_TYPE.IMAGE}>
                        {({openPicker}) => (
                            <>
                                <Tooltip text={props.translate('avatarWithImagePicker.editImage')}>
                                    <View style={[styles.smallEditIcon, styles.smallAvatarEditIcon]}>
                                        <Icon
                                            src={Expensicons.Camera}
                                            width={variables.iconSizeSmall}
                                            height={variables.iconSizeSmall}
                                            fill={themeColors.textLight}
                                        />
                                    </View>
                                </Tooltip>
                                <PopoverMenu
                                    isVisible={isMenuVisible}
                                    onClose={() => setIsMenuVisible(false)}
                                    onItemSelected={() => setIsMenuVisible(false)}
                                    menuItems={createMenuItems(openPicker)}
                                    anchorPosition={props.anchorPosition}
                                    anchorAlignment={props.anchorAlignment}
                                />
                            </>
                        )}
                    </AttachmentPicker>
                </View>
            </PressableWithoutFeedback>
            <ConfirmModal
                title={errorModalTitle}
                onConfirm={hideErrorModal}
                onCancel={hideErrorModal}
                isVisible={isErrorModalVisible}
                prompt={errorModalPrompt}
                confirmText={props.translate('common.close')}
                shouldShowCancelButton={false}
            />
            <AvatarCropModal
                onClose={hideAvatarCropModal}
                isVisible={isAvatarCropModalOpen}
                onSave={props.onImageSelected}
                imageUri={imageUri}
                imageName={imageName}
                imageType={imageType}
                maskImage={props.editorMaskImage}
            />
        </View>
    );
}

AvatarWithImagePicker.propTypes = propTypes;
AvatarWithImagePicker.defaultProps = defaultProps;

export default withLocalize(AvatarWithImagePicker);
