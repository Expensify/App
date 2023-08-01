import _ from 'underscore';
import React, {useState, useEffect, useCallback} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import PopoverWithMeasuredContent from '../PopoverWithMeasuredContent';
import styles from '../../styles/styles';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';
import MenuItem from '../MenuItem';
import {propTypes as createMenuPropTypes, defaultProps as createMenuDefaultProps} from './popoverMenuPropTypes';
import Text from '../Text';
import CONST from '../../CONST';
import useArrowKeyFocusManager from '../../hooks/useArrowKeyFocusManager';
import useKeyboardShortcut from '../../hooks/useKeyboardShortcut';
import useWindowDimensions from '../../hooks/useWindowDimensions';

const propTypes = {
    ...createMenuPropTypes,
    ...windowDimensionsPropTypes,

    /** Defines the anchor points for the popover */
    anchorPosition: PropTypes.shape({
        horizontal: PropTypes.number.isRequired,
        vertical: PropTypes.number.isRequired,
    }).isRequired,

    /** Sets the popover's position relative to the anchor points */
    anchorAlignment: PropTypes.shape({
        horizontal: PropTypes.oneOf(_.values(CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL)),
        vertical: PropTypes.oneOf(_.values(CONST.MODAL.ANCHOR_ORIGIN_VERTICAL)),
    }),

    /** Indicates whether navigation should occur before closing the modal */
    shouldNavigateBeforeClosingModal: PropTypes.bool,
};

const defaultProps = {
    ...createMenuDefaultProps,
    anchorAlignment: {
        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
    },
    shouldNavigateBeforeClosingModal: false,
};

function PopoverMenu(props) {
    const {isSmallScreenWidth} = useWindowDimensions();
    const [selectedItemIndex, setSelectedItemIndex] = useState(null);
    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({initialFocusedIndex: -1, maxIndex: props.menuItems.length - 1, isActive: props.isVisible});

    const onModalHide = useCallback(() => {
        if (selectedItemIndex == null) {
            return;
        }

        setFocusedIndex(-1);
        props.menuItems[selectedItemIndex].onSelected();
        setSelectedItemIndex(null);
    }, [props.menuItems, selectedItemIndex, setFocusedIndex]);

    useEffect(() => {
        if (!props.shouldNavigateBeforeClosingModal) {
            return;
        }
        onModalHide();
    }, [onModalHide, props.shouldNavigateBeforeClosingModal]);

    const selectItem = (index) => {
        const selectedItem = props.menuItems[index];
        props.onItemSelected(selectedItem);
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
            anchorAlignment={props.anchorAlignment}
            onClose={props.onClose}
            onModalHide={() => {
                if (props.shouldNavigateBeforeClosingModal) {
                    return;
                }
                onModalHide();
            }}
            isVisible={props.isVisible}
            animationIn={props.animationIn}
            animationOut={props.animationOut}
            animationInTiming={props.animationInTiming}
            disableAnimation={props.disableAnimation}
            fromSidebarMediumScreen={props.fromSidebarMediumScreen}
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
