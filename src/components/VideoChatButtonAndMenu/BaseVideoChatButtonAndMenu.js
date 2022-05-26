import _ from 'underscore';
import React, {Component} from 'react';
import {
    View, Pressable, Dimensions, Linking,
} from 'react-native';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import Popover from '../Popover';
import MenuItem from '../MenuItem';
import ZoomIcon from '../../../assets/images/zoom-icon.svg';
import GoogleMeetIcon from '../../../assets/images/google-meet.svg';
import CONST from '../../CONST';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';
import withWindowDimensions from '../withWindowDimensions';
import withLocalize from '../withLocalize';
import compose from '../../libs/compose';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import Tooltip from '../Tooltip';
import {propTypes, defaultProps} from './videoChatButtonAndMenuPropTypes';

class BaseVideoChatButtonAndMenu extends Component {
    constructor(props) {
        super(props);

        this.dimensionsEventListener = null;

        this.toggleVideoChatMenu = this.toggleVideoChatMenu.bind(this);
        this.measureVideoChatIconPosition = this.measureVideoChatIconPosition.bind(this);
        this.videoChatIconWrapper = null;
        this.menuItemData = [
            {
                icon: ZoomIcon,
                text: props.translate('videoChatButtonAndMenu.zoom'),
                onPress: () => {
                    this.toggleVideoChatMenu();
                    Linking.openURL(CONST.NEW_ZOOM_MEETING_URL);
                },
            },
            {
                icon: GoogleMeetIcon,
                text: props.translate('videoChatButtonAndMenu.googleMeet'),
                onPress: () => {
                    this.toggleVideoChatMenu();
                    Linking.openURL(this.props.newGoogleMeetingUrl || CONST.NEW_GOOGLE_MEET_MEETING_URL);
                },
            },
        ];

        this.state = {
            isVideoChatMenuActive: false,
            videoChatIconPosition: {x: 0, y: 0},
        };
    }

    componentDidMount() {
        this.dimensionsEventListener = Dimensions.addEventListener('change', this.measureVideoChatIconPosition);
    }

    componentWillUnmount() {
        if (!this.dimensionsEventListener) {
            return;
        }
        this.dimensionsEventListener.remove();
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
        if (!this.videoChatIconWrapper) {
            return;
        }

        this.videoChatIconWrapper.measureInWindow((x, y) => this.setState({
            videoChatIconPosition: {x, y},
        }));
    }

    render() {
        return (
            <>
                <View
                    ref={el => this.videoChatIconWrapper = el}
                    onLayout={this.measureVideoChatIconPosition}
                >
                    <Tooltip text={this.props.translate('videoChatButtonAndMenu.tooltip')}>
                        <Pressable
                            onPress={() => {
                                // If this is the Concierge chat, we'll open the modal for requesting a setup call instead
                                if (this.props.isConcierge) {
                                    Navigation.navigate(ROUTES.getRequestCallRoute(CONST.GUIDES_CALL_TASK_IDS.CONCIERGE_DM));
                                    return;
                                }
                                this.toggleVideoChatMenu();
                            }}
                            style={[styles.touchableButtonImage, styles.mr0]}
                        >
                            <Icon
                                src={Expensicons.Phone}
                                fill={(this.props.isConcierge || this.state.isVideoChatMenuActive)
                                    ? themeColors.heading
                                    : themeColors.icon}
                            />
                        </Pressable>
                    </Tooltip>
                </View>
                <Popover
                    onClose={this.toggleVideoChatMenu}
                    isVisible={this.state.isVideoChatMenuActive}
                    anchorPosition={{
                        left: this.state.videoChatIconPosition.x - 150,
                        top: this.state.videoChatIconPosition.y + 40,
                    }}
                >
                    {_.map(this.menuItemData, ({icon, text, onPress}) => (
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

BaseVideoChatButtonAndMenu.propTypes = propTypes;
BaseVideoChatButtonAndMenu.defaultProps = defaultProps;

export default compose(
    withWindowDimensions,
    withLocalize,
)(BaseVideoChatButtonAndMenu);
