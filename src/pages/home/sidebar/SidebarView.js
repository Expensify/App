import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../styles/StyleSheet';
import SidebarBottom from './SidebarBottom';
import SidebarLinks from './SidebarLinks';
import SafeAreaInsetPropTypes from '../../SafeAreaInsetPropTypes';

const propTypes = {
    // Toggles the hamburger menu open and closed
    onLinkClick: PropTypes.func.isRequired,

    // Safe area insets required for mobile devices margins
    insets: SafeAreaInsetPropTypes.isRequired,

    // when the chat switcher is selected
    isChatSwitcherActive: PropTypes.bool,
};

class SidebarView extends React.Component {
    render() {
        return (
            <View style={[styles.flex1, styles.sidebar]}>
                <SidebarLinks
                    onLinkClick={this.props.onLinkClick}
                    insets={this.props.insets}
                    isChatSwitcherActive={this.props.isChatSwitcherActive}
                />
                {!this.props.isChatSwitcherActive && (
                    <SidebarBottom insets={this.props.insets} />
                )}
            </View>
        );
    }
}

SidebarView.propTypes = propTypes;

export default SidebarView;
