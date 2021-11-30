import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Text from '../../components/Text';
import styles from '../../styles/styles';
import MenuItemList from '../../components/MenuItemList';
import Icon from '../../components/Icon';
import menuItemPropTypes from '../../components/menuItemPropTypes';

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
};

const defaultProps = {
    menuItems: null,
    children: null,
    icon: null,
    IconComponent: null,
};

const WorkspaceSection = (props) => {
    const IconComponent = props.IconComponent;
    return (
        <>
            <View style={styles.pageWrapper}>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.w100]}>
                    <View style={[styles.flexShrink1]}>
                        <Text style={[styles.h1]}>{props.title}</Text>
                    </View>
                    <View style={[styles.flexGrow1, styles.flexRow, styles.justifyContentEnd]}>
                        {props.icon && <Icon src={props.icon} height={80} width={80} />}
                        {IconComponent && <IconComponent />}
                    </View>
                </View>

                <View style={[styles.w100]}>
                    {props.children}
                </View>
            </View>

            {props.menuItems && <MenuItemList menuItems={props.menuItems} />}
        </>
    );
};

WorkspaceSection.displayName = 'WorkspaceSection';
WorkspaceSection.propTypes = propTypes;
WorkspaceSection.defaultProps = defaultProps;

export default WorkspaceSection;
