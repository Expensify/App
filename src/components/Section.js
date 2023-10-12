import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import styles from '@styles/styles';
import Icon from './Icon';
import {imagePropTypes} from './Image/imagePropTypes';
import MenuItemList from './MenuItemList';
import menuItemPropTypes from './menuItemPropTypes';
import Text from './Text';

const propTypes = {
    /** An array of props that are pass to individual MenuItem components */
    menuItems: PropTypes.arrayOf(PropTypes.shape(menuItemPropTypes)),

    /** The text to display in the title of the section */
    title: PropTypes.string.isRequired,

    /** The text to display in the subtitle of the section */
    subtitle: PropTypes.string,

    /** The icon to display along with the title */
    icon: PropTypes.oneOfType([PropTypes.func, imagePropTypes.source]),

    /** Icon name required to create the icon test ID  */
    iconName: PropTypes.string,

    /** Icon component */
    IconComponent: PropTypes.func,

    /** Contents to display inside the section */
    children: PropTypes.node,

    /** Customize the Section container */
    // eslint-disable-next-line react/forbid-prop-types
    containerStyles: PropTypes.arrayOf(PropTypes.object),

    /** Customize the Section container */
    // eslint-disable-next-line react/forbid-prop-types
    titleStyles: PropTypes.arrayOf(PropTypes.object),

    /** Customize the Section container */
    // eslint-disable-next-line react/forbid-prop-types
    subtitleStyles: PropTypes.arrayOf(PropTypes.object),

    /** Customize the Section container */
    // eslint-disable-next-line react/forbid-prop-types
    childrenStyles: PropTypes.arrayOf(PropTypes.object),

    /** Customize the Icon container */
    // eslint-disable-next-line react/forbid-prop-types
    iconContainerStyles: PropTypes.arrayOf(PropTypes.object),

    /** The fill color for the icon displayed in the section. Can be hex, rgb, rgba, or valid react-native named color such as 'red' or 'blue'. */
    iconFill: PropTypes.string,
};

const defaultProps = {
    menuItems: null,
    children: null,
    icon: null,
    iconName: '',
    IconComponent: null,
    containerStyles: [],
    iconContainerStyles: [],
    titleStyles: [],
    subtitleStyles: [],
    childrenStyles: [],
    subtitle: null,
    iconFill: null,
};

function Section({children, childrenStyles, containerStyles, icon, iconName, IconComponent, iconContainerStyles, menuItems, subtitle, subtitleStyles, title, titleStyles}) {
    return (
        <>
            <View style={[styles.pageWrapper, styles.cardSection, ...containerStyles]}>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.w100, ...titleStyles]}>
                    <View style={[styles.flexShrink1]}>
                        <Text style={[styles.textHeadline, styles.cardSectionTitle]}>{title}</Text>
                    </View>
                    <View style={[styles.flexGrow1, styles.flexRow, styles.justifyContentEnd, ...iconContainerStyles]}>
                        {Boolean(icon) && (
                            <Icon
                                src={icon}
                                name={iconName}
                                height={68}
                                width={68}
                                fill={props.iconFill}
                            />
                        )}
                        {Boolean(IconComponent) && <IconComponent />}
                    </View>
                </View>

                {Boolean(subtitle) && (
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.w100, styles.mt4, ...subtitleStyles]}>
                        <Text style={styles.textNormal}>{subtitle}</Text>
                    </View>
                )}

                <View style={[styles.w100, ...childrenStyles]}>{children}</View>

                <View style={[styles.w100]}>{Boolean(menuItems) && <MenuItemList menuItems={menuItems} />}</View>
            </View>
        </>
    );
}

Section.displayName = 'Section';
Section.propTypes = propTypes;
Section.defaultProps = defaultProps;

export default Section;
