import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Dimensions, View} from 'react-native';
import GoogleMeetIcon from '@assets/images/google-meet.svg';
import ZoomIcon from '@assets/images/zoom-icon.svg';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import Popover from '@components/Popover';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Tooltip from '@components/Tooltip/PopoverAnchorTooltip';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as Link from '@userActions/Link';
import * as Session from '@userActions/Session';
import CONST from '@src/CONST';
import type VideoChatButtonAndMenuProps from './types';

type BaseVideoChatButtonAndMenuProps = VideoChatButtonAndMenuProps & {
    /** Link to open when user wants to create a new google meet meeting */
    googleMeetURL: string;
};

function BaseVideoChatButtonAndMenu({googleMeetURL, isConcierge = false, guideCalendarLink}: BaseVideoChatButtonAndMenuProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isSmallScreenWidth} = useWindowDimensions();
    const [isVideoChatMenuActive, setIsVideoChatMenuActive] = useState(false);
    const [videoChatIconPosition, setVideoChatIconPosition] = useState({x: 0, y: 0});
    const videoChatIconWrapperRef = useRef<View>(null);
    const videoChatButtonRef = useRef<View>(null);

    const menuItemData = [
        {
            icon: ZoomIcon,
            text: translate('videoChatButtonAndMenu.zoom'),
            onPress: () => {
                setIsVideoChatMenuActive(false);
                Link.openExternalLink(CONST.NEW_ZOOM_MEETING_URL);
            },
        },
        {
            icon: GoogleMeetIcon,
            text: translate('videoChatButtonAndMenu.googleMeet'),
            onPress: () => {
                setIsVideoChatMenuActive(false);
                Link.openExternalLink(googleMeetURL);
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
                <Tooltip text={translate('videoChatButtonAndMenu.tooltip')}>
                    <PressableWithoutFeedback
                        ref={videoChatButtonRef}
                        onPress={Session.checkIfActionIsAllowed(() => {
                            // Drop focus to avoid blue focus ring.
                            videoChatButtonRef.current?.blur();

                            // If this is the Concierge chat, we'll open the modal for requesting a setup call instead
                            if (isConcierge && guideCalendarLink) {
                                Link.openExternalLink(guideCalendarLink);
                                return;
                            }
                            setIsVideoChatMenuActive((previousVal) => !previousVal);
                        })}
                        style={styles.touchableButtonImage}
                        accessibilityLabel={translate('videoChatButtonAndMenu.tooltip')}
                        role={CONST.ROLE.BUTTON}
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
                <View style={isSmallScreenWidth ? {} : styles.pv3}>
                    {menuItemData.map(({icon, text, onPress}) => (
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

BaseVideoChatButtonAndMenu.displayName = 'BaseVideoChatButtonAndMenu';

export default BaseVideoChatButtonAndMenu;
