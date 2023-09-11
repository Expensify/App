import _ from 'underscore';
import React from 'react';
import {View} from 'react-native';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import * as StyleUtils from '../../../styles/StyleUtils';
import Icon from '../../../components/Icon';
import getButtonState from '../../../libs/getButtonState';
import CONST from '../../../CONST';
import PressableWithSecondaryInteraction from '../../../components/PressableWithSecondaryInteraction';
import * as DeviceCapabilities from '../../../libs/DeviceCapabilities';
import ControlSelection from '../../../libs/ControlSelection';
import Hoverable from '../../../components/Hoverable';
import variables from '../../../styles/variables';

const propTypes = {};

const defaultProps = {
    badgeText: undefined,
    shouldShowRightIcon: false,
    shouldShowSelectedState: false,
    shouldShowBasicTitle: false,
    shouldShowDescriptionOnTop: false,
    shouldShowHeaderTitle: false,
    wrapperStyle: [],
    style: styles.popoverMenuItem,
    titleStyle: {},
    shouldShowTitleIcon: false,
    titleIcon: () => {},
    descriptionTextStyle: styles.breakWord,
    success: false,
    icon: undefined,
    secondaryIcon: undefined,
    iconWidth: undefined,
    iconHeight: undefined,
    description: undefined,
    iconStyles: [],
    iconFill: undefined,
    secondaryIconFill: undefined,
    focused: false,
    disabled: false,
    isSelected: false,
    subtitle: undefined,
    subtitleTextStyle: {},
    iconType: CONST.ICON_TYPE_ICON,
    onPress: () => {},
    onSecondaryInteraction: undefined,
    interactive: true,
    brickRoadIndicator: '',
    floatRightAvatars: [],
    shouldStackHorizontally: false,
    floatRightAvatarSize: undefined,
    shouldBlockSelection: false,
    hoverAndPressStyle: [],
    furtherDetails: '',
    furtherDetailsIcon: undefined,
    isAnonymousAction: false,
    isSmallAvatarSubscriptMenu: false,
    title: '',
    numberOfLinesTitle: 1,
    shouldGreyOutWhenDisabled: true,
};

const GlobalNavigationMenuItem = React.forwardRef((props, ref) => (
        <Hoverable>
            {(isHovered) => (
                <PressableWithSecondaryInteraction
                    onPress={(e) => props.onPress(e)}
                    onPressIn={() => DeviceCapabilities.canUseTouchScreen() && ControlSelection.block()}
                    onPressOut={ControlSelection.unblock}
                    onSecondaryInteraction={props.onSecondaryInteraction}
                    style={({pressed}) => [
                        props.style,
                        !props.interactive && styles.cursorDefault,
                        StyleUtils.getButtonBackgroundColorStyle(getButtonState(props.focused || isHovered, pressed), true),
                        (isHovered || pressed) && props.hoverAndPressStyle,
                    ]}
                    disabled={props.disabled}
                    ref={ref}
                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.MENUITEM}
                    accessibilityLabel={props.title ? props.title.toString() : ''}
                >
                    {({pressed}) => (
                        <>
                            <View style={[styles.flexColumn, styles.flex1]}>
                                <View style={[styles.popoverMenuIcon, ...props.iconStyles, StyleUtils.getAvatarWidthStyle(props.avatarSize)]}>
                                        <Icon
                                            hovered={isHovered}
                                            pressed={pressed}
                                            src={props.icon}
                                            width={props.iconWidth}
                                            height={props.iconHeight}
                                            fill={
                                                props.iconFill ||
                                                StyleUtils.getIconFillColor(
                                                    getButtonState(props.focused || isHovered, pressed, props.success, props.disabled, props.interactive),
                                                    true,
                                                )
                                            }
                                        />
                                </View>
                                <View style={[styles.mt1, styles.alignItemsCenter]}>
                                        <Text style={StyleUtils.getFontSizeStyle(variables.fontSizeExtraSmall)}>
                                            {props.title}
                                        </Text>
                                    </View>
                            </View>
                        </>
                    )}
                </PressableWithSecondaryInteraction>
            )}
        </Hoverable>
    ));

GlobalNavigationMenuItem.propTypes = propTypes;
GlobalNavigationMenuItem.defaultProps = defaultProps;
GlobalNavigationMenuItem.displayName = 'GlobalNavigationMenuItem';

export default GlobalNavigationMenuItem;
