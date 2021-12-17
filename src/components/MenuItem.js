import _ from 'underscore';
import React from 'react';
import {
    View, Pressable,
} from 'react-native';
import ExpensifyText from './ExpensifyText';
import styles from '../styles/styles';
import * as StyleUtils from '../styles/StyleUtils';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import getButtonState from '../libs/getButtonState';
import Avatar from './Avatar';
import Badge from './Badge';
import CONST from '../CONST';
import menuItemPropTypes from './menuItemPropTypes';
import SelectCircle from './SelectCircle';

const propTypes = {
    ...menuItemPropTypes,
};

const defaultProps = {
    badgeText: undefined,
    shouldShowRightIcon: false,
    shouldShowSelectedState: false,
    wrapperStyle: [],
    success: false,
    icon: undefined,
    iconWidth: undefined,
    iconHeight: undefined,
    description: undefined,
    iconRight: Expensicons.ArrowRight,
    iconStyles: [],
    iconFill: undefined,
    focused: false,
    disabled: false,
    isSelected: false,
    subtitle: undefined,
    iconType: 'icon',
    onPress: () => {},
    interactive: true,
};

const MenuItem = props => (
    <Pressable
        onPress={(e) => {
            if (props.disabled) {
                return;
            }

            props.onPress(e);
        }}
        style={({hovered, pressed}) => ([
            styles.popoverMenuItem,
            StyleUtils.getButtonBackgroundColorStyle(getButtonState(props.focused || hovered, pressed, props.success, props.disabled, props.interactive)),
            ..._.isArray(props.wrapperStyle) ? props.wrapperStyle : [props.wrapperStyle],
        ])}
        disabled={props.disabled}
    >
        {({hovered, pressed}) => (
            <>
                <View style={styles.flexRow}>
                    {(props.icon && props.iconType === CONST.ICON_TYPE_ICON) && (
                        <View
                            style={[
                                styles.popoverMenuIcon,
                                ...props.iconStyles,
                            ]}
                        >
                            <Icon
                                src={props.icon}
                                width={props.iconWidth}
                                height={props.iconHeight}
                                fill={props.iconFill || StyleUtils.getIconFillColor(
                                    getButtonState(props.focused || hovered, pressed, props.success, props.disabled, props.interactive),
                                )}
                            />
                        </View>
                    )}
                    {(props.icon && props.iconType === CONST.ICON_TYPE_AVATAR) && (
                        <View
                            style={[
                                styles.popoverMenuIcon,
                                ...props.iconStyles,
                            ]}
                        >
                            <Avatar
                                imageStyles={[styles.avatarNormal, styles.alignSelfCenter]}
                                source={props.icon}
                            />
                        </View>
                    )}
                    <View style={[styles.justifyContentCenter, styles.menuItemTextContainer]}>
                        <ExpensifyText
                            style={[
                                styles.popoverMenuText,
                                styles.ml3,
                                (props.interactive && props.disabled ? styles.disabledText : undefined),
                            ]}
                            numberOfLines={1}
                        >
                            {props.title}
                        </ExpensifyText>
                        {props.description && (
                            <ExpensifyText style={[styles.textLabelSupporting, styles.ml3, styles.mt1]}>
                                {props.description}
                            </ExpensifyText>
                        )}
                    </View>
                </View>
                <View style={[styles.flexRow, styles.menuItemTextContainer]}>
                    {props.badgeText && <Badge text={props.badgeText} badgeStyles={[styles.alignSelfCenter]} />}
                    {props.subtitle && (
                        <View style={[styles.justifyContentCenter, styles.mr1]}>
                            <ExpensifyText
                                style={styles.textLabelSupporting}
                            >
                                {props.subtitle}
                            </ExpensifyText>
                        </View>
                    )}
                    {props.shouldShowRightIcon && (
                        <View style={styles.popoverMenuIcon}>
                            <Icon
                                src={props.iconRight}
                                fill={StyleUtils.getIconFillColor(getButtonState(props.focused || hovered, pressed, props.success, props.disabled, props.interactive))}
                            />
                        </View>
                    )}
                    {props.shouldShowSelectedState && <SelectCircle isChecked={props.isSelected} />}
                </View>
            </>
        )}
    </Pressable>
);

MenuItem.propTypes = propTypes;
MenuItem.defaultProps = defaultProps;
MenuItem.displayName = 'MenuItem';

export default MenuItem;
