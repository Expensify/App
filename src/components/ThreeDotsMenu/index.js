import React, {useState, useRef} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import Icon from '../Icon';
import PopoverMenu from '../PopoverMenu';
import styles from '../../styles/styles';
import useLocalize from '../../hooks/useLocalize';
import Tooltip from '../Tooltip';
import * as Expensicons from '../Icon/Expensicons';
import ThreeDotsMenuItemPropTypes from './ThreeDotsMenuItemPropTypes';
import CONST from '../../CONST';
import PressableWithoutFeedback from '../Pressable/PressableWithoutFeedback';

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
};

const defaultProps = {
    iconTooltip: 'common.more',
    iconFill: undefined,
    iconStyles: [],
    icon: Expensicons.ThreeDots,
    onIconPress: () => {},
    anchorAlignment: {
        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP, // we assume that popover menu opens below the button, anchor is at TOP
    },
};

function ThreeDotsMenu({iconTooltip, icon, iconFill, iconStyles, onIconPress, menuItems, anchorPosition, anchorAlignment}) {
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
                        ref={buttonRef}
                        style={[styles.touchableButtonImage, ...iconStyles]}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
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
                withoutOverlay
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
