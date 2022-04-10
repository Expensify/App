import _ from 'underscore';
import React from 'react';
import {
    Pressable, View, Animated, StyleSheet,
} from 'react-native';
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
};

class AvatarWithImagePicker extends React.Component {
    constructor(props) {
        super(props);
        this.animation = new SpinningIndicatorAnimation();
        this.setUploadLimitModalVisibility = this.setUploadLimitModalVisibility.bind(this);
        this.isValidSize = this.isValidSize.bind(this);
        this.state = {
            isMenuVisible: false,
            isMaxUploadSizeModalOpen: false,
            isAvatarCropModalOpen: false,
            image: {},
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
     *  Toggle max upload limit modal's visibility
     * @param {Boolean} isVisible
    */
    setUploadLimitModalVisibility(isVisible) {
        this.setState({isMaxUploadSizeModalOpen: isVisible});
    }

    /**
     *  Checks if image has valid size and updates avatar
     * @param {Object} image
    */
    updateAvatarImage(image) {
        if (!this.isValidSize(image)) {
            this.setUploadLimitModalVisibility(true);
            return;
        }
        this.props.onImageSelected(image);
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
     *  Opens avatars crop modal and sets image to state
     * @param {Object} image
    */
    openAvatarCropModal(image) {
        this.setState({isAvatarCropModalOpen: true, image});
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
                        onPicked: avatar => this.openAvatarCropModal(avatar),
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
                                                        animationIn="fadeInDown"
                                                        animationOut="fadeOutUp"
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
                    title={this.props.translate('avatarWithImagePicker.imageUploadFailed')}
                    onConfirm={() => this.setUploadLimitModalVisibility(false)}
                    onCancel={() => this.setUploadLimitModalVisibility(false)}
                    isVisible={this.state.isMaxUploadSizeModalOpen}
                    prompt={this.props.translate('avatarWithImagePicker.sizeExceeded', {maxUploadSizeInMB: CONST.AVATAR_MAX_ATTACHMENT_SIZE / (1024 * 1024)})}
                    confirmText={this.props.translate('common.close')}
                    shouldShowCancelButton={false}
                />
                <AvatarCropModal
                    onClose={() => this.setState({isAvatarCropModalOpen: false, image: {}})}
                    isVisible={this.state.isAvatarCropModalOpen}
                    onCrop={image => this.updateAvatarImage(image)}
                    imageUri={this.state.image.uri}
                />
            </View>
        );
    }
}

AvatarWithImagePicker.propTypes = propTypes;
AvatarWithImagePicker.defaultProps = defaultProps;

export default withLocalize(AvatarWithImagePicker);
