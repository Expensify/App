import PropTypes from 'prop-types';
import React, {useRef} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
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
    const selectedItemIndex = useRef(null);
    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({initialFocusedIndex: -1, maxIndex: props.menuItems.length - 1, isActive: props.isVisible});

    const selectItem = (index) => {
        const selectedItem = props.menuItems[index];
        props.onItemSelected(selectedItem, index);
        selectedItemIndex.current = index;
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
                if (selectedItemIndex.current !== null) {
                    props.menuItems[selectedItemIndex.current].onSelected();
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
                {_.map(props.menuItems, (item, menuIndex) => (
                    <MenuItem
                        key={item.text}
                        icon={item.icon}
                        iconWidth={item.iconWidth}
                        iconHeight={item.iconHeight}
                        iconFill={item.iconFill}
                        title={item.text}
                        shouldCheckActionAllowedOnPress={false}
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
