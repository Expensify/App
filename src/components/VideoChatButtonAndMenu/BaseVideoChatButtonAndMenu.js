import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Dimensions, View} from 'react-native';
import _ from 'underscore';
import GoogleMeetIcon from '@assets/images/google-meet.svg';
import ZoomIcon from '@assets/images/zoom-icon.svg';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import Popover from '@components/Popover';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Tooltip from '@components/Tooltip/PopoverAnchorTooltip';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from '@components/withWindowDimensions';
import compose from '@libs/compose';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import * as Link from '@userActions/Link';
import * as Session from '@userActions/Session';
import CONST from '@src/CONST';
import {defaultProps, propTypes as videoChatButtonAndMenuPropTypes} from './videoChatButtonAndMenuPropTypes';

const propTypes = {
    /** Link to open when user wants to create a new google meet meeting */
    googleMeetURL: PropTypes.string.isRequired,

    ...videoChatButtonAndMenuPropTypes,
    ...withLocalizePropTypes,
    ...windowDimensionsPropTypes,
};

function BaseVideoChatButtonAndMenu(props) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const [isVideoChatMenuActive, setIsVideoChatMenuActive] = useState(false);
    const [videoChatIconPosition, setVideoChatIconPosition] = useState({x: 0, y: 0});
    const videoChatIconWrapperRef = useRef(null);
    const videoChatButtonRef = useRef(null);

    const menuItemData = [
        {
            icon: ZoomIcon,
            text: props.translate('videoChatButtonAndMenu.zoom'),
            onPress: () => {
                setIsVideoChatMenuActive(false);
                Link.openExternalLink(CONST.NEW_ZOOM_MEETING_URL);
            },
        },
        {
            icon: GoogleMeetIcon,
            text: props.translate('videoChatButtonAndMenu.googleMeet'),
            onPress: () => {
                setIsVideoChatMenuActive(false);
                Link.openExternalLink(props.googleMeetURL);
            },
        },
    ];

    /**
     * This gets called onLayout to find the coordinates of the wrapper for the video chat button.
     */
    const measureVideoChatIconPosition = useCallback(() => {
        if (!videoChatIconWrapperRef.current) {
            return;
        }

        videoChatIconWrapperRef.current.measureInWindow((x, y) => {
            setVideoChatIconPosition({x, y});
        });
    }, []);

    useEffect(() => {
        const dimensionsEventListener = Dimensions.addEventListener('change', measureVideoChatIconPosition);

        return () => {
            if (!dimensionsEventListener) {
                return;
            }

            dimensionsEventListener.remove();
        };
    }, [measureVideoChatIconPosition]);

    return (
        <>
            <View
                ref={videoChatIconWrapperRef}
                onLayout={measureVideoChatIconPosition}
            >
                <Tooltip text={props.translate('videoChatButtonAndMenu.tooltip')}>
                    <PressableWithoutFeedback
                        ref={videoChatButtonRef}
                        onPress={Session.checkIfActionIsAllowed(() => {
                            // Drop focus to avoid blue focus ring.
                            videoChatButtonRef.current.blur();

                            // If this is the Concierge chat, we'll open the modal for requesting a setup call instead
                            if (props.isConcierge && props.guideCalendarLink) {
                                Link.openExternalLink(props.guideCalendarLink);
                                return;
                            }
                            setIsVideoChatMenuActive((previousVal) => !previousVal);
                        })}
                        style={styles.touchableButtonImage}
                        accessibilityLabel={props.translate('videoChatButtonAndMenu.tooltip')}
                        role={CONST.ACCESSIBILITY_ROLE.BUTTON}
                    >
                        <Icon
                            src={Expensicons.Phone}
                            fill={isVideoChatMenuActive ? theme.heading : theme.icon}
                        />
                    </PressableWithoutFeedback>
                </Tooltip>
            </View>

            <Popover
                onClose={() => setIsVideoChatMenuActive(false)}
                isVisible={isVideoChatMenuActive}
                anchorPosition={{
                    left: videoChatIconPosition.x - 150,
                    top: videoChatIconPosition.y + 40,
                }}
                withoutOverlay
                anchorRef={videoChatButtonRef}
            >
                <View style={props.isSmallScreenWidth ? {} : styles.pv3}>
                    {_.map(menuItemData, ({icon, text, onPress}) => (
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

BaseVideoChatButtonAndMenu.propTypes = propTypes;
BaseVideoChatButtonAndMenu.defaultProps = defaultProps;
BaseVideoChatButtonAndMenu.displayName = 'BaseVideoChatButtonAndMenu';

export default compose(withWindowDimensions, withLocalize)(BaseVideoChatButtonAndMenu);
