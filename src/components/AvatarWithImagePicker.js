import React from 'react';
import {Pressable, View} from 'react-native';
import PropTypes from 'prop-types';
import Avatar from './Avatar';
import Icon from './Icon';
import PopoverMenu from './PopoverMenu';
import {
    Upload, Trashcan, Pencil,
} from './Icon/Expensicons';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import AttachmentPicker from './AttachmentPicker';
import withLocalize, {withLocalizePropTypes} from './withLocalize';

const propTypes = {
    /** Avatar URL to display */
    avatarURL: PropTypes.string.isRequired,

    onImageSelected: PropTypes.func,

    onImageRemoved: PropTypes.func,

    ...withLocalizePropTypes,
};

const defaultProps = {
    onImageSelected: () => {},
    onImageRemoved: () => {},
};

class AvatarWithImagePicker extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isMenuVisible: false,
        };
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
                text: this.props.translate('profilePage.uploadPhoto'),
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
                text: this.props.translate('profilePage.removePhoto'),
                onSelected: () => {
                    this.props.onImageRemoved();
                },
            });
        }
        return menuItems;
    }

    render() {
        return (
            <View style={[styles.alignItemsCenter]}>
                <View style={[styles.pRelative, styles.avatarLarge]}>
                    <Avatar
                        containerStyles={styles.avatarLarge}
                        imageStyles={[styles.avatarLarge, styles.alignSelfCenter]}
                        source={this.props.avatarURL}
                    />
                    <AttachmentPicker>
                        {({openPicker}) => (
                            <>
                                <Pressable
                                    style={[styles.smallEditIcon]}
                                    onPress={() => this.setState({isMenuVisible: true})}
                                >
                                    <Icon src={Pencil} fill={themeColors.iconReversed} />
                                </Pressable>
                                <PopoverMenu
                                    isVisible={this.state.isMenuVisible}
                                    onClose={() => this.setState({isMenuVisible: false})}
                                    onItemSelected={() => this.setState({isMenuVisible: false})}
                                    menuItems={this.createMenuItems(openPicker)}
                                    anchorPosition={styles.createMenuPositionProfile}
                                    animationIn="fadeInRight"
                                    animationOut="fadeOutRight"
                                />
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
