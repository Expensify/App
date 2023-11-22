import PropTypes from 'prop-types';
import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import refPropTypes from '@components/refPropTypes';
import Text from '@components/Text';
import withWindowDimensions, {windowDimensionsPropTypes} from '@components/withWindowDimensions';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useWindowDimensions from '@hooks/useWindowDimensions';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import {defaultProps as createMenuDefaultProps, propTypes as createMenuPropTypes} from './popoverMenuPropTypes';

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

    /** Should we announce the Modal visibility changes? */
    shouldSetModalVisibility: PropTypes.bool,
};

const defaultProps = {
    ...createMenuDefaultProps,
    anchorAlignment: {
        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
    },
    anchorRef: () => {},
    withoutOverlay: false,
    shouldSetModalVisibility: true,
};

function PopoverMenu(props) {
    const styles = useThemeStyles();
    const {isSmallScreenWidth} = useWindowDimensions();

    const [menuItems, setMenuItems] = useState(props.menuItems);
    const [enteredSubMenuIndexes, setEnteredSubMenuIndexes] = useState([]);

    const selectedItemIndex = useRef(null);
    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({initialFocusedIndex: -1, maxIndex: menuItems.length - 1, isActive: props.isVisible});

    const selectItem = (index) => {
        const selectedItem = menuItems[index];
        if (selectedItem.subMenuItems) {
            setMenuItems([...selectedItem.subMenuItems]);
            setEnteredSubMenuIndexes([...enteredSubMenuIndexes, index]);
        } else {
            props.onItemSelected(selectedItem, index);
            selectedItemIndex.current = index;
        }
    };

    const getPreviousSubMenu = () => {
        let currentMenuItems = props.menuItems;
        for (let i = 0; i < enteredSubMenuIndexes.length - 1; i++) {
            currentMenuItems = currentMenuItems[enteredSubMenuIndexes[i]].subMenuItems;
        }
        return currentMenuItems;
    };

    const renderBackButtonItem = () => {
        const previousMenuItems = getPreviousSubMenu();
        const previouslySelectedItem = previousMenuItems[enteredSubMenuIndexes[enteredSubMenuIndexes.length - 1]];

        return (
            <MenuItem
                key={previouslySelectedItem.text}
                icon={Expensicons.BackArrow}
                iconFill="gray"
                title={previouslySelectedItem.text}
                shouldCheckActionAllowedOnPress={false}
                description={previouslySelectedItem.description}
                onPress={() => {
                    setMenuItems(previousMenuItems);
                    enteredSubMenuIndexes.splice(-1);
                }}
            />
        );
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

    useEffect(() => {
        if (menuItems.length !== 0) {
            return;
        }
        setMenuItems(props.menuItems);
    }, [menuItems, props.menuItems]);

    return (
        <PopoverWithMeasuredContent
            anchorPosition={props.anchorPosition}
            anchorRef={props.anchorRef}
            anchorAlignment={props.anchorAlignment}
            onClose={() => {
                setMenuItems([]);
                setEnteredSubMenuIndexes([]);
                props.onClose();
            }}
            isVisible={props.isVisible}
            onModalHide={() => {
                setFocusedIndex(-1);
                if (selectedItemIndex.current !== null) {
                    menuItems[selectedItemIndex.current].onSelected();
                    selectedItemIndex.current = null;
                }
            }}
            animationIn={props.animationIn}
            animationOut={props.animationOut}
            animationInTiming={props.animationInTiming}
            disableAnimation={props.disableAnimation}
            fromSidebarMediumScreen={props.fromSidebarMediumScreen}
            withoutOverlay={props.withoutOverlay}
            shouldSetModalVisibility={props.shouldSetModalVisibility}
        >
            <View style={isSmallScreenWidth ? {} : styles.createMenuContainer}>
                {!_.isEmpty(props.headerText) && <Text style={[styles.createMenuHeaderText, styles.ml3]}>{props.headerText}</Text>}
                {enteredSubMenuIndexes.length > 0 && renderBackButtonItem()}
                {_.map(menuItems, (item, menuIndex) => (
                    <MenuItem
                        key={item.text + menuIndex}
                        icon={item.icon}
                        iconWidth={item.iconWidth}
                        iconHeight={item.iconHeight}
                        iconFill={item.iconFill}
                        title={item.text}
                        shouldCheckActionAllowedOnPress={false}
                        description={item.description}
                        onPress={() => selectItem(menuIndex)}
                        focused={focusedIndex === menuIndex}
                        shouldShowRightIcon={item.shouldShowRightIcon}
                        shouldPutLeftPaddingWhenNoIcon={item.shouldPutLeftPaddingWhenNoIcon}
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
