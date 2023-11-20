import PropTypes from 'prop-types';
import React, {useRef, useState} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PopoverMenu from '@components/PopoverMenu';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Tooltip from '@components/Tooltip/PopoverAnchorTooltip';
import useLocalize from '@hooks/useLocalize';
import * as Browser from '@libs/Browser';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import ThreeDotsMenuItemPropTypes from './ThreeDotsMenuItemPropTypes';

const propTypes = {
    /** Tooltip for the popup icon */
    iconTooltip: PropTypes.string,

    /** icon for the popup trigger */
    icon: PropTypes.oneOfType([PropTypes.elementType, PropTypes.string]),

    /** Any additional styles to pass to the icon container. */
    // eslint-disable-next-line react/forbid-prop-types
    iconStyles: PropTypes.arrayOf(PropTypes.object),

    /** The fill color to pass into the icon. */
    iconFill: PropTypes.string,

    /** Function to call on icon press */
    onIconPress: PropTypes.func,

    /** menuItems that'll show up on toggle of the popup menu */
    menuItems: ThreeDotsMenuItemPropTypes.isRequired,

    /** The anchor position of the menu */
    anchorPosition: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }).isRequired,

    /** The anchor alignment of the menu */
    anchorAlignment: PropTypes.shape({
        horizontal: PropTypes.oneOf(_.values(CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL)),
        vertical: PropTypes.oneOf(_.values(CONST.MODAL.ANCHOR_ORIGIN_VERTICAL)),
    }),

    /** Whether the popover menu should overlay the current view */
    shouldOverlay: PropTypes.bool,

    /** Whether the menu is disabled */
    disabled: PropTypes.bool,

    /** Should we announce the Modal visibility changes? */
    shouldSetModalVisibility: PropTypes.bool,
};

const defaultProps = {
    iconTooltip: 'common.more',
    disabled: false,
    iconFill: undefined,
    iconStyles: [],
    icon: Expensicons.ThreeDots,
    onIconPress: () => {},
    anchorAlignment: {
        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP, // we assume that popover menu opens below the button, anchor is at TOP
    },
    shouldOverlay: false,
    shouldSetModalVisibility: true,
};

function ThreeDotsMenu({iconTooltip, icon, iconFill, iconStyles, onIconPress, menuItems, anchorPosition, anchorAlignment, shouldOverlay, shouldSetModalVisibility, disabled}) {
    const styles = useThemeStyles();
    const [isPopupMenuVisible, setPopupMenuVisible] = useState(false);
    const buttonRef = useRef(null);
    const {translate} = useLocalize();

    const showPopoverMenu = () => {
        setPopupMenuVisible(true);
    };

    const hidePopoverMenu = () => {
        setPopupMenuVisible(false);
    };

    return (
        <>
            <View>
                <Tooltip text={translate(iconTooltip)}>
                    <PressableWithoutFeedback
                        onPress={() => {
                            if (isPopupMenuVisible) {
                                hidePopoverMenu();
                                return;
                            }
                            showPopoverMenu();
                            if (onIconPress) {
                                onIconPress();
                            }
                        }}
                        disabled={disabled}
                        onMouseDown={(e) => {
                            /* Keep the focus state on mWeb like we did on the native apps. */
                            if (!Browser.isMobile()) {
                                return;
                            }
                            e.preventDefault();
                        }}
                        ref={buttonRef}
                        style={[styles.touchableButtonImage, ...iconStyles]}
                        role={CONST.ACCESSIBILITY_ROLE.BUTTON}
                        accessibilityLabel={translate(iconTooltip)}
                    >
                        <Icon
                            src={icon}
                            fill={iconFill}
                        />
                    </PressableWithoutFeedback>
                </Tooltip>
            </View>
            <PopoverMenu
                onClose={hidePopoverMenu}
                isVisible={isPopupMenuVisible}
                anchorPosition={anchorPosition}
                anchorAlignment={anchorAlignment}
                onItemSelected={hidePopoverMenu}
                menuItems={menuItems}
                withoutOverlay={!shouldOverlay}
                shouldSetModalVisibility={shouldSetModalVisibility}
                anchorRef={buttonRef}
            />
        </>
    );
}

ThreeDotsMenu.propTypes = propTypes;
ThreeDotsMenu.defaultProps = defaultProps;
ThreeDotsMenu.displayName = 'ThreeDotsMenu';

export default ThreeDotsMenu;

export {ThreeDotsMenuItemPropTypes};
