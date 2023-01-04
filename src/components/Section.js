import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Text from './Text';
import styles from '../styles/styles';
import MenuItemList from './MenuItemList';
import Icon from './Icon';
import menuItemPropTypes from './menuItemPropTypes';

const propTypes = {
    /** An array of props that are pass to individual MenuItem components */
    menuItems: PropTypes.arrayOf(PropTypes.shape(menuItemPropTypes)),

    /** The text to display in the title of the section */
    title: PropTypes.string.isRequired,

    /** The icon to display along with the title */
    icon: PropTypes.func,

    /** Icon component */
    IconComponent: PropTypes.func,

    /** Contents to display inside the section */
    children: PropTypes.node,

    /** Customize the Section container */
    // eslint-disable-next-line react/forbid-prop-types
    containerStyles: PropTypes.arrayOf(PropTypes.object),
};

const defaultProps = {
    menuItems: null,
    children: null,
    icon: null,
    IconComponent: null,
    containerStyles: [],
};

const Section = (props) => {
    const IconComponent = props.IconComponent;
    return (
        <>
            <View style={[styles.pageWrapper, styles.cardSection, ...props.containerStyles]}>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.w100]}>
                    <View style={[styles.flexShrink1]}>
                        <Text style={[styles.sectionHeader]}>{props.title}</Text>
                    </View>
                    <View style={[styles.flexGrow1, styles.flexRow, styles.justifyContentEnd]}>
                        {props.icon && <Icon src={props.icon} height={68} width={68} />}
                        {IconComponent && <IconComponent />}
                    </View>
                </View>

                <View style={[styles.w100]}>
                    {props.children}
                </View>

                <View style={[styles.w100]}>
                    {props.menuItems && <MenuItemList menuItems={props.menuItems} />}
                </View>
            </View>

        </>
    );
};

Section.displayName = 'Section';
Section.propTypes = propTypes;
Section.defaultProps = defaultProps;

export default Section;
