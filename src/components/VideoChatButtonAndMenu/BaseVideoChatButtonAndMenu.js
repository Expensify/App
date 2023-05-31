import _ from 'underscore';
import React, {Component} from 'react';
import {View, Pressable, Dimensions, Linking} from 'react-native';
import PropTypes from 'prop-types';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import Popover from '../Popover';
import MenuItem from '../MenuItem';
import ZoomIcon from '../../../assets/images/zoom-icon.svg';
import GoogleMeetIcon from '../../../assets/images/google-meet.svg';
import CONST from '../../CONST';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import compose from '../../libs/compose';
import Tooltip from '../Tooltip';
import {propTypes as videoChatButtonAndMenuPropTypes, defaultProps} from './videoChatButtonAndMenuPropTypes';
import * as Session from '../../libs/actions/Session';

const propTypes = {
    /** Link to open when user wants to create a new google meet meeting */
    googleMeetURL: PropTypes.string.isRequired,

    ...videoChatButtonAndMenuPropTypes,
    ...withLocalizePropTypes,
    ...windowDimensionsPropTypes,
};

class BaseVideoChatButtonAndMenu extends Component {
    constructor(props) {
        super(props);

        this.dimensionsEventListener = null;

        this.measureVideoChatIconPosition = this.measureVideoChatIconPosition.bind(this);
        this.videoChatIconWrapper = null;
        this.menuItemData = [
            {
                icon: ZoomIcon,
                text: props.translate('videoChatButtonAndMenu.zoom'),
                onPress: () => {
                    this.setMenuVisibility(false);
                    Linking.openURL(CONST.NEW_ZOOM_MEETING_URL);
                },
            },
            {
                icon: GoogleMeetIcon,
                text: props.translate('videoChatButtonAndMenu.googleMeet'),
                onPress: () => {
                    this.setMenuVisibility(false);
                    Linking.openURL(this.props.googleMeetURL);
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
     * Set the state variable isVideoChatMenuActive
     * @param {Boolean} isVideoChatMenuActive
     */
    setMenuVisibility(isVideoChatMenuActive) {
        this.setState({isVideoChatMenuActive});
    }

    /**
     * This gets called onLayout to find the cooridnates of the wrapper for the video chat button.
     */
    measureVideoChatIconPosition() {
        if (!this.videoChatIconWrapper) {
            return;
        }

        this.videoChatIconWrapper.measureInWindow((x, y) =>
            this.setState({
                videoChatIconPosition: {x, y},
            }),
        );
    }

    render() {
        return (
            <>
                <View
                    ref={(el) => (this.videoChatIconWrapper = el)}
                    onLayout={this.measureVideoChatIconPosition}
                >
                    <Tooltip text={this.props.translate('videoChatButtonAndMenu.tooltip')}>
                        <Pressable
                            ref={(el) => (this.videoChatButton = el)}
                            onPress={Session.checkIfActionIsAllowed(() => {
                                // Drop focus to avoid blue focus ring.
                                this.videoChatButton.blur();

                                // If this is the Concierge chat, we'll open the modal for requesting a setup call instead
                                if (this.props.isConcierge && this.props.guideCalendarLink) {
                                    Linking.openURL(this.props.guideCalendarLink);
                                    return;
                                }
                                this.setMenuVisibility(true);
                            })}
                            style={[styles.touchableButtonImage]}
                        >
                            <Icon
                                src={Expensicons.Phone}
                                fill={this.state.isVideoChatMenuActive ? themeColors.heading : themeColors.icon}
                            />
                        </Pressable>
                    </Tooltip>
                </View>
                <Popover
                    onClose={() => this.setMenuVisibility(false)}
                    isVisible={this.state.isVideoChatMenuActive}
                    anchorPosition={{
                        left: this.state.videoChatIconPosition.x - 150,
                        top: this.state.videoChatIconPosition.y + 40,
                    }}
                >
                    <View style={this.props.isSmallScreenWidth ? {} : styles.pv3}>
                        {_.map(this.menuItemData, ({icon, text, onPress}) => (
                            <MenuItem
                                wrapperStyle={styles.mr3}
                                key={text}
                                icon={icon}
                                title={text}
                                onPress={onPress}
                            />
                        ))}
                    </View>
                </Popover>
            </>
        );
    }
}

BaseVideoChatButtonAndMenu.propTypes = propTypes;
BaseVideoChatButtonAndMenu.defaultProps = defaultProps;

export default compose(withWindowDimensions, withLocalize)(BaseVideoChatButtonAndMenu);
