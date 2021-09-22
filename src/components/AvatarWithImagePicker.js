import _ from 'underscore';
import React from 'react';
import {
    Pressable, View, Animated, StyleSheet,
} from 'react-native';
import PropTypes from 'prop-types';
import Avatar from './Avatar';
import Icon from './Icon';
import PopoverMenu from './PopoverMenu';
import {
    Upload, Trashcan, Pencil, Sync,
} from './Icon/Expensicons';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import AttachmentPicker from './AttachmentPicker';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import variables from '../styles/variables';
import CONST from '../CONST';
import SpinningIndicatorAnimation from '../styles/animation/SpinningIndicatorAnimation';

const propTypes = {
    /** Avatar URL to display */
    avatarURL: PropTypes.string,

    /** Additional style props */
    style: PropTypes.oneOfType([PropTypes.object, PropTypes.arrayOf(PropTypes.object)]),

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
    size: PropTypes.string,

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
        this.state = {
            isMenuVisible: false,
        };
    }

    componentDidMount() {
        if (this.props.isUploading) {
            this.animation.start();
        }
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
     * Create menu items list for avatar menu
     *
     * @param {Function} openPicker
     * @returns {Array}
     */
    createMenuItems(openPicker) {
        const menuItems = [
            {
                icon: Upload,
                text: this.props.translate('avatarWithImagePicker.uploadPhoto'),
                onSelected: () => {
                    openPicker({
                        onPicked: this.props.onImageSelected,
                    });
                },
            },
        ];

        // If current avatar isn't a default avatar, allow Remove Photo option
        if (!this.props.isUsingDefaultAvatar) {
            menuItems.push({
                icon: Trashcan,
                text: this.props.translate('avatarWithImagePicker.removePhoto'),
                onSelected: () => {
                    this.props.onImageRemoved();
                },
            });
        }
        return menuItems;
    }

    render() {
        const {DefaultAvatar} = this.props;
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
                                                    src={Sync}
                                                    fill={themeColors.textReversed}
                                                    width={indicatorIconSize}
                                                    height={indicatorIconSize}
                                                />
                                            </Animated.View>
                                        )
                                        : (
                                            <>
                                                <Pressable
                                                    disabled={this.props.isUploading}
                                                    style={[styles.smallEditIcon, styles.smallAvatarEditIcon]}
                                                    onPress={() => this.setState({isMenuVisible: true})}
                                                >
                                                    <Icon
                                                        src={Pencil}
                                                        width={variables.iconSizeSmall}
                                                        height={variables.iconSizeSmall}
                                                        fill={themeColors.iconReversed}
                                                    />
                                                </Pressable>
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
            </View>
        );
    }
}

AvatarWithImagePicker.propTypes = propTypes;
AvatarWithImagePicker.defaultProps = defaultProps;

export default withLocalize(AvatarWithImagePicker);
