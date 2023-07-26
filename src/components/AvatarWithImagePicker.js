import _ from 'underscore';
import React from 'react';
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
import SpinningIndicatorAnimation from '../styles/animation/SpinningIndicatorAnimation';
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
    isUploading: PropTypes.bool,

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
    isUploading: false,
    size: CONST.AVATAR_SIZE.DEFAULT,
    fallbackIcon: Expensicons.FallbackAvatar,
    type: CONST.ICON_TYPE_AVATAR,
    editorMaskImage: undefined,
    errorRowStyles: [],
    onErrorClose: () => {},
    pendingAction: null,
    errors: null,
};

class AvatarWithImagePicker extends React.Component {
    constructor(props) {
        super(props);
        this.animation = new SpinningIndicatorAnimation();
        this.hideErrorModal = this.hideErrorModal.bind(this);
        this.showErrorModal = this.showErrorModal.bind(this);
        this.isValidSize = this.isValidSize.bind(this);
        this.showAvatarCropModal = this.showAvatarCropModal.bind(this);
        this.hideAvatarCropModal = this.hideAvatarCropModal.bind(this);
        this.state = {
            isMenuVisible: false,
            isErrorModalVisible: false,
            errorModalPrompt: '',
            errorModalTitle: '',
            isAvatarCropModalOpen: false,
            imageName: '',
            imageUri: '',
            imageType: '',
        };
    }

    componentDidMount() {
        if (!this.props.isUploading) {
            return;
        }

        this.animation.start();
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.isUploading && this.props.isUploading) {
            this.animation.start();
        } else if (prevProps.isUploading && !this.props.isUploading) {
            this.animation.stop();
        }
    }

    componentWillUnmount() {
        this.animation.stop();
    }

    /**
     * @param {String} title
     * @param {String} prompt
     */
    showErrorModal(title, prompt) {
        this.setState({isErrorModalVisible: true, errorModalTitle: title, errorModalPrompt: prompt});
    }

    hideErrorModal() {
        this.setState({isErrorModalVisible: false});
    }

    /**
     * Check if the attachment extension is allowed.
     *
     * @param {Object} image
     * @returns {Boolean}
     */
    isValidExtension(image) {
        const {fileExtension} = FileUtils.splitExtensionFromFileName(lodashGet(image, 'name', ''));
        return _.contains(CONST.AVATAR_ALLOWED_EXTENSIONS, fileExtension.toLowerCase());
    }

    /**
     * Check if the attachment size is less than allowed size.
     *
     * @param {Object} image
     * @returns {Boolean}
     */
    isValidSize(image) {
        return image && lodashGet(image, 'size', 0) < CONST.AVATAR_MAX_ATTACHMENT_SIZE;
    }

    /**
     * Check if the attachment resolution matches constraints.
     *
     * @param {Object} image
     * @returns {Promise}
     */
    isValidResolution(image) {
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
    showAvatarCropModal(image) {
        if (!this.isValidExtension(image)) {
            this.showErrorModal(
                this.props.translate('avatarWithImagePicker.imageUploadFailed'),
                this.props.translate('avatarWithImagePicker.notAllowedExtension', {allowedExtensions: CONST.AVATAR_ALLOWED_EXTENSIONS}),
            );
            return;
        }
        if (!this.isValidSize(image)) {
            this.showErrorModal(
                this.props.translate('avatarWithImagePicker.imageUploadFailed'),
                this.props.translate('avatarWithImagePicker.sizeExceeded', {maxUploadSizeInMB: CONST.AVATAR_MAX_ATTACHMENT_SIZE / (1024 * 1024)}),
            );
            return;
        }

        this.isValidResolution(image).then((isValidResolution) => {
            if (!isValidResolution) {
                this.showErrorModal(
                    this.props.translate('avatarWithImagePicker.imageUploadFailed'),
                    this.props.translate('avatarWithImagePicker.resolutionConstraints', {
                        minHeightInPx: CONST.AVATAR_MIN_HEIGHT_PX,
                        minWidthInPx: CONST.AVATAR_MIN_WIDTH_PX,
                        maxHeightInPx: CONST.AVATAR_MAX_HEIGHT_PX,
                        maxWidthInPx: CONST.AVATAR_MAX_WIDTH_PX,
                    }),
                );
                return;
            }

            this.setState({
                isAvatarCropModalOpen: true,
                isMenuVisible: false,
                imageUri: image.uri,
                imageName: image.name,
                imageType: image.type,
            });
        });
    }

    hideAvatarCropModal() {
        this.setState({isAvatarCropModalOpen: false});
    }

    /**
     * Create menu items list for avatar menu
     *
     * @param {Function} openPicker
     * @returns {Array}
     */
    createMenuItems(openPicker) {
        const menuItems = [
            {
                icon: Expensicons.Upload,
                text: this.props.translate('avatarWithImagePicker.uploadPhoto'),
                onSelected: () => {
                    openPicker({
                        onPicked: this.showAvatarCropModal,
                    });
                },
            },
        ];

        // If current avatar isn't a default avatar, allow Remove Photo option
        if (!this.props.isUsingDefaultAvatar) {
            menuItems.push({
                icon: Expensicons.Trashcan,
                text: this.props.translate('avatarWithImagePicker.removePhoto'),
                onSelected: () => {
                    this.props.onImageRemoved();
                },
            });
        }
        return menuItems;
    }

    render() {
        const DefaultAvatar = this.props.DefaultAvatar;
        const additionalStyles = _.isArray(this.props.style) ? this.props.style : [this.props.style];

        return (
            <View style={[styles.alignItemsCenter, ...additionalStyles]}>
                <PressableWithoutFeedback
                    onPress={() => this.setState({isMenuVisible: true})}
                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.IMAGEBUTTON}
                    accessibilityLabel={this.props.translate('avatarWithImagePicker.editImage')}
                    disabled={this.state.isAvatarCropModalOpen}
                >
                    <View style={[styles.pRelative, styles.avatarLarge]}>
                        <OfflineWithFeedback
                            pendingAction={this.props.pendingAction}
                            errors={this.props.errors}
                            errorRowStyles={this.props.errorRowStyles}
                            onClose={this.props.onErrorClose}
                        >
                            <Tooltip text={this.props.translate('avatarWithImagePicker.editImage')}>
                                <View>
                                    {this.props.source ? (
                                        <Avatar
                                            containerStyles={styles.avatarLarge}
                                            imageStyles={[styles.avatarLarge, styles.alignSelfCenter]}
                                            source={this.props.source}
                                            fallbackIcon={this.props.fallbackIcon}
                                            size={this.props.size}
                                            type={this.props.type}
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
                                    <Tooltip text={this.props.translate('avatarWithImagePicker.editImage')}>
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
                                        isVisible={this.state.isMenuVisible}
                                        onClose={() => this.setState({isMenuVisible: false})}
                                        onItemSelected={() => this.setState({isMenuVisible: false})}
                                        menuItems={this.createMenuItems(openPicker)}
                                        anchorPosition={this.props.anchorPosition}
                                        anchorAlignment={this.props.anchorAlignment}
                                    />
                                </>
                            )}
                        </AttachmentPicker>
                    </View>
                </PressableWithoutFeedback>
                <ConfirmModal
                    title={this.state.errorModalTitle}
                    onConfirm={this.hideErrorModal}
                    onCancel={this.hideErrorModal}
                    isVisible={this.state.isErrorModalVisible}
                    prompt={this.state.errorModalPrompt}
                    confirmText={this.props.translate('common.close')}
                    shouldShowCancelButton={false}
                />
                <AvatarCropModal
                    onClose={this.hideAvatarCropModal}
                    isVisible={this.state.isAvatarCropModalOpen}
                    onSave={this.props.onImageSelected}
                    imageUri={this.state.imageUri}
                    imageName={this.state.imageName}
                    imageType={this.state.imageType}
                    maskImage={this.props.editorMaskImage}
                />
            </View>
        );
    }
}

AvatarWithImagePicker.propTypes = propTypes;
AvatarWithImagePicker.defaultProps = defaultProps;

export default withLocalize(AvatarWithImagePicker);
