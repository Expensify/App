import React, {Component} from 'react';
import {
    View, Pressable, Dimensions, Linking,
} from 'react-native';
import Icon from './Icon';
import {Phone} from './Icon/Expensicons';
import Popover from './Popover';
import MenuItem from './MenuItem';
import ZoomIcon from '../../assets/images/zoom-icon.svg';
import GoogleMeetIcon from '../../assets/images/google-meet.svg';
import CONST from '../CONST';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import compose from '../libs/compose';

const propTypes = {
    ...withLocalizePropTypes,
    ...windowDimensionsPropTypes,
};

class VideoChatButtonAndMenu extends Component {
    constructor(props) {
        super(props);

        this.toggleVideoChatMenu = this.toggleVideoChatMenu.bind(this);
        this.measureVideoChatIconPosition = this.measureVideoChatIconPosition.bind(this);
        this.videoChatIconWrapper = null;
        this.menuItemData = [
            {
                icon: ZoomIcon,
                text: props.translate('videoChatButtonAndMenu.zoom'),
                onPress: () => Linking.openURL(CONST.NEW_ZOOM_MEETING_URL),
            },
            {
                icon: GoogleMeetIcon,
                text: props.translate('videoChatButtonAndMenu.googleMeet'),
                onPress: () => Linking.openURL(CONST.NEW_GOOGLE_MEET_MEETING_URL),
            },
        ].map(item => ({
            ...item,
            onPress: () => {
                item.onPress();
                this.toggleVideoChatMenu();
            },
        }));

        this.state = {
            isVideoChatMenuActive: false,
            videoChatIconPosition: {x: 0, y: 0},
        };
    }

    componentDidMount() {
        Dimensions.addEventListener('change', this.measureVideoChatIconPosition);
    }

    componentWillUnmount() {
        Dimensions.removeEventListener('change', this.measureVideoChatIconPosition);
    }

    /**
     * Toggles the state variable isVideoChatMenuActive
     */
    toggleVideoChatMenu() {
        this.setState(prevState => ({
            isVideoChatMenuActive: !prevState.isVideoChatMenuActive,
        }));
    }

    /**
     * This gets called onLayout to find the cooridnates of the wrapper for the video chat button.
     */
    measureVideoChatIconPosition() {
        if (this.videoChatIconWrapper) {
            this.videoChatIconWrapper.measureInWindow((x, y) => this.setState({
                videoChatIconPosition: {x, y},
            }));
        }
    }

    render() {
        return (
            <>
                <View
                    ref={el => this.videoChatIconWrapper = el}
                    onLayout={this.measureVideoChatIconPosition}
                >
                    <Pressable
                        onPress={() => {
                            this.toggleVideoChatMenu();
                        }}
                        style={[styles.touchableButtonImage, styles.mr0]}
                    >
                        <Icon
                            src={Phone}
                            fill={this.state.isVideoChatMenuActive
                                ? themeColors.heading
                                : themeColors.icon}
                        />
                    </Pressable>
                </View>
                <Popover
                    onClose={this.toggleVideoChatMenu}
                    isVisible={this.state.isVideoChatMenuActive}
                    anchorPosition={{
                        left: this.state.videoChatIconPosition.x - 150,
                        top: this.state.videoChatIconPosition.y + 40,
                    }}
                    animationIn="fadeInDown"
                    animationOut="fadeOutUp"
                >
                    {this.menuItemData.map(({icon, text, onPress}) => (
                        <MenuItem
                            wrapperStyle={styles.mr3}
                            key={text}
                            icon={icon}
                            title={text}
                            onPress={onPress}
                        />
                    ))}
                </Popover>
            </>
        );
    }
}

VideoChatButtonAndMenu.propTypes = propTypes;
VideoChatButtonAndMenu.displayName = 'VideoChatButtonAndMenu';
export default compose(
    withWindowDimensions,
    withLocalize,
)(VideoChatButtonAndMenu);
