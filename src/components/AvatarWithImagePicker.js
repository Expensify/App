import _ from 'underscore';
import React from 'react';
import {
    Pressable, View, Animated, StyleSheet,
} from 'react-native';
import PropTypes from 'prop-types';
import ImageSize from 'react-native-image-size';
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
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import variables from '../styles/variables';
import CONST from '../CONST';
import SpinningIndicatorAnimation from '../styles/animation/SpinningIndicatorAnimation';
import Tooltip from './Tooltip';
import stylePropTypes from '../styles/stylePropTypes';

const propTypes = {
    /** Avatar URL to display */
    avatarURL: PropTypes.string,

    /** Additional style props */
    style: stylePropTypes,

    /** Executed once an image has been selected */
    onImageSelected: PropTypes.func,

    /** Execute when the user taps "remove" */
    onImageRemoved: PropTypes.func,

    /** A default avatar component to display when there is no avatarURL */
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

    ...withLocalizePropTypes,
};

const defaultProps = {
    avatarURL: '',
    onImageSelected: () => {},
    onImageRemoved: () => {},
    style: [],
    DefaultAvatar: () => {},
    isUsingDefaultAvatar: false,
    isUploading: false,
    size: CONST.AVATAR_SIZE.DEFAULT,
    fallbackIcon: Expensicons.FallbackAvatar,
};

class AvatarWithImagePicker extends React.Component {
    constructor(props) {
        super(props);
        this.animation = new SpinningIndicatorAnimation();
        this.hideErrorModal = this.hideErrorModal.bind(this);
        this.showErrorModal = this.showErrorModal.bind(this);
        this.isValidSize = this.isValidSize.bind(this);
        this.updateAvatarImage = this.updateAvatarImage.bind(this);
        this.openAvatarCropModal = this.openAvatarCropModal.bind(this);
        this.state = {
            isMenuVisible: false,
            isErrorModalVisible: false,
            errorModalPrompt: '',
            errorModalTitle: '',
            isAvatarCropModalOpen: false,
            image: null,
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
     *  Show the error modal
     * @param {String} title
     * @param {String} prompt
     */
    showErrorModal(title, prompt) {
        this.setState({isErrorModalVisible: true, errorModalTitle: title, errorModalPrompt: prompt});
    }

    /**
     *  Hide the error modal
     */
    hideErrorModal() {
        this.setState({isErrorModalVisible: false});
    }

    /**
     *  Checks if the image has the valid size and triggers the onImageSelected callback
     * @param {Object} image
     */
    updateAvatarImage(image) {
        if (this.isValidSize(image)) {
            this.props.onImageSelected(image);
            return;
        }

        // Since in react native we can't show two modals simultaneously
        // we have to add delay before opening another one
        setTimeout(() => this.showErrorModal(
            this.props.translate('avatarWithImagePicker.imageUploadFailed'),
            this.props.translate('avatarWithImagePicker.sizeExceeded', {maxUploadSizeInMB: CONST.AVATAR_MAX_ATTACHMENT_SIZE / (1024 * 1024)}),
        ), 500);
    }

    /**
     * Check if the attachment size is less than allowed size.
     * @param {Object} image
     * @returns {Boolean}
     */
    isValidSize(image) {
        return image && lodashGet(image, 'size', 0) < CONST.AVATAR_MAX_ATTACHMENT_SIZE;
    }

    /**
     * Check if the attachment resolution is bigger than required.
     * @param {Object} image
     * @returns {Promise}
     */
    isValidResolution(image) {
        return new Promise((resolve) => {
            ImageSize.getSize(image.uri).then(({height, width}) => {
                resolve(height > CONST.AVATAR_MIN_HEIGHT_PX && width > CONST.AVATAR_MIN_WIDTH_PX);
            });
        });
    }

    /** Validates if an image has a valid resolution and opens an avatar crop modal
     * @param {Object} image
     */
    openAvatarCropModal(image) {
        this.isValidResolution(image)
            .then((isValidResolution) => {
                if (isValidResolution) {
                    this.setState({isAvatarCropModalOpen: true, image});
                    return;
                }
                this.showErrorModal(
                    this.props.translate('avatarWithImagePicker.imageUploadFailed'),
                    this.props.translate('avatarWithImagePicker.tooSmallResolution', {
                        minHeightInPx: CONST.AVATAR_MIN_HEIGHT_PX,
                        minWidthInPx: CONST.AVATAR_MIN_WIDTH_PX,
                    }),
                );
            });
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
                        onPicked: this.openAvatarCropModal,
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

        const indicatorStyles = [
            styles.alignItemsCenter,
            styles.justifyContentCenter,
            this.props.size === CONST.AVATAR_SIZE.LARGE ? styles.statusIndicatorLarge : styles.statusIndicator,
            styles.statusIndicatorOnline,
            this.animation.getSyncingStyles(),
        ];

        const indicatorIconSize = this.props.size === CONST.AVATAR_SIZE.LARGE ? variables.iconSizeXXSmall : variables.iconSizeXXXSmall;

        return (
            <View style={[styles.alignItemsCenter, ...additionalStyles]}>
                <Pressable
                    onPress={() => this.setState({isMenuVisible: true})}
                    disabled={this.props.isUploading}
                >
                    <View style={[styles.pRelative, styles.avatarLarge]}>
                        {this.props.avatarURL
                            ? (
                                <Avatar
                                    containerStyles={styles.avatarLarge}
                                    imageStyles={[styles.avatarLarge, styles.alignSelfCenter]}
                                    source={this.props.avatarURL}
                                    fallbackIcon={this.props.fallbackIcon}
                                    size={this.props.size}
                                />
                            )
                            : (
                                <DefaultAvatar />
                            )}
                        <AttachmentPicker type={CONST.ATTACHMENT_PICKER_TYPE.IMAGE}>
                            {({openPicker}) => (
                                <>
                                    {
                                        this.props.isUploading
                                            ? (
                                                <Animated.View style={StyleSheet.flatten(indicatorStyles)}>

                                                    <Icon
                                                        src={Expensicons.Sync}
                                                        fill={themeColors.textReversed}
                                                        width={indicatorIconSize}
                                                        height={indicatorIconSize}
                                                    />
                                                </Animated.View>
                                            )
                                            : (
                                                <>
                                                    <Tooltip absolute text={this.props.translate('avatarWithImagePicker.editImage')}>
                                                        <View style={[styles.smallEditIcon, styles.smallAvatarEditIcon]}>
                                                            <Icon
                                                                src={Expensicons.Camera}
                                                                width={variables.iconSizeSmall}
                                                                height={variables.iconSizeSmall}
                                                                fill={themeColors.iconReversed}
                                                            />
                                                        </View>
                                                    </Tooltip>
                                                    <PopoverMenu
                                                        isVisible={this.state.isMenuVisible}
                                                        onClose={() => this.setState({isMenuVisible: false})}
                                                        onItemSelected={() => this.setState({isMenuVisible: false})}
                                                        menuItems={this.createMenuItems(openPicker)}
                                                        anchorPosition={this.props.anchorPosition}
                                                    />
                                                </>
                                            )
                                    }
                                </>
                            )}
                        </AttachmentPicker>
                    </View>
                </Pressable>
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
                    onClose={() => this.setState({isAvatarCropModalOpen: false})}
                    isVisible={this.state.isAvatarCropModalOpen}
                    onSave={this.updateAvatarImage}
                    imageUri={lodashGet(this.state.image, 'uri')}
                />
            </View>
        );
    }
}

AvatarWithImagePicker.propTypes = propTypes;
AvatarWithImagePicker.defaultProps = defaultProps;

export default withLocalize(AvatarWithImagePicker);
