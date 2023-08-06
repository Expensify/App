import _ from 'underscore';
import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import PopoverWithMeasuredContent from '../PopoverWithMeasuredContent';
import styles from '../../styles/styles';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';
import MenuItem from '../MenuItem';
import {propTypes as createMenuPropTypes, defaultProps as createMenuDefaultProps} from './popoverMenuPropTypes';
import refPropTypes from '../refPropTypes';
import Text from '../Text';
import CONST from '../../CONST';
import useArrowKeyFocusManager from '../../hooks/useArrowKeyFocusManager';
import useKeyboardShortcut from '../../hooks/useKeyboardShortcut';
import useWindowDimensions from '../../hooks/useWindowDimensions';

const propTypes = {
    ...createMenuPropTypes,
    ...windowDimensionsPropTypes,

    /** The horizontal and vertical anchors points for the popover */
    anchorPosition: PropTypes.shape({
        horizontal: PropTypes.number.isRequired,
        vertical: PropTypes.number.isRequired,
    }).isRequired,

    /** Ref of the anchor */
    anchorRef: refPropTypes,

    /** Where the popover should be positioned relative to the anchor points. */
    anchorAlignment: PropTypes.shape({
        horizontal: PropTypes.oneOf(_.values(CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL)),
        vertical: PropTypes.oneOf(_.values(CONST.MODAL.ANCHOR_ORIGIN_VERTICAL)),
    }),

    withoutOverlay: PropTypes.bool,
};

const defaultProps = {
    ...createMenuDefaultProps,
    anchorAlignment: {
        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
    },
    anchorRef: () => {},
    withoutOverlay: false,
};

function PopoverMenu(props) {
    const {isSmallScreenWidth} = useWindowDimensions();
    const [selectedItemIndex, setSelectedItemIndex] = useState(null);
    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({initialFocusedIndex: -1, maxIndex: props.menuItems.length - 1, isActive: props.isVisible});

    const selectItem = (index) => {
        const selectedItem = props.menuItems[index];
        props.onItemSelected(selectedItem, index);
        setSelectedItemIndex(index);
    };

    useKeyboardShortcut(
        CONST.KEYBOARD_SHORTCUTS.ENTER,
        () => {
            if (focusedIndex === -1) {
                return;
            }
            selectItem(focusedIndex);
            setFocusedIndex(-1); // Reset the focusedIndex on selecting any menu
        },
        {isActive: props.isVisible},
    );

    return (
        <PopoverWithMeasuredContent
            anchorPosition={props.anchorPosition}
            anchorRef={props.anchorRef}
            anchorAlignment={props.anchorAlignment}
            onClose={props.onClose}
            isVisible={props.isVisible}
            onModalHide={() => {
                setFocusedIndex(-1);
                if (selectedItemIndex !== null) {
                    props.menuItems[selectedItemIndex].onSelected();
                    setSelectedItemIndex(null);
                }
            }}
            animationIn={props.animationIn}
            animationOut={props.animationOut}
            animationInTiming={props.animationInTiming}
            disableAnimation={props.disableAnimation}
            fromSidebarMediumScreen={props.fromSidebarMediumScreen}
            withoutOverlay={props.withoutOverlay}
        >
            <View style={isSmallScreenWidth ? {} : styles.createMenuContainer}>
                {!_.isEmpty(props.headerText) && <Text style={[styles.createMenuHeaderText, styles.ml3]}>{props.headerText}</Text>}
                {_.map(props.menuItems, (item, menuIndex) => (
                    <MenuItem
                        key={item.text}
                        icon={item.icon}
                        iconWidth={item.iconWidth}
                        iconHeight={item.iconHeight}
                        title={item.text}
                        description={item.description}
                        onPress={() => selectItem(menuIndex)}
                        focused={focusedIndex === menuIndex}
                    />
                ))}
            </View>
        </PopoverWithMeasuredContent>
    );
}

PopoverMenu.propTypes = propTypes;
PopoverMenu.defaultProps = defaultProps;
PopoverMenu.displayName = 'PopoverMenu';

export default React.memo(withWindowDimensions(PopoverMenu));
