import React from 'react';
import {View, Text} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import MenuItemList from '../../components/MenuItemList';
import Icon from '../../components/Icon';
import MenuItemPropTypes from '../../components/MenuItemPropTypes';

const propTypes = {
    /** An array of props that are pass to individual MenuItem components */
    menuItems: PropTypes.arrayOf(PropTypes.shape(MenuItemPropTypes)),

    /** The text to display in the title of the section */
    title: PropTypes.string.isRequired,

    /** The icon to display along with the title */
    icon: PropTypes.func.isRequired,

    /** Contents to display inside the section */
    children: PropTypes.node,
};

const defaultProps = {
    menuItems: null,
    children: null,
};

const WorkspaceSection = ({
    menuItems,
    title,
    icon,
    children,
}) => (
    <>
        <View style={styles.pageWrapper}>
            <View style={[styles.flexRow, styles.alignItemsCenter]}>
                <View style={[styles.flexShrink1]}>
                    <Text style={[styles.textXLarge]}>{title}</Text>
                </View>
                <View style={[styles.flexGrow1, styles.flexRow, styles.justifyContentEnd]}>
                    <Icon src={icon} height={50} width={50} />
                </View>
            </View>

            <View style={[styles.w100]}>
                {children}
            </View>
        </View>

        {menuItems && <MenuItemList menuItems={menuItems} />}
    </>
);

WorkspaceSection.displayName = 'WorkspaceSection';
WorkspaceSection.propTypes = propTypes;
WorkspaceSection.defaultProps = defaultProps;

export default WorkspaceSection;
