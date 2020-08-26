import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../style/StyleSheet';
import SidebarBottom from './SidebarBottom';
import SidebarLinks from './SidebarLinks';
import SafeAreaInsetPropTypes from '../../SafeAreaInsetPropTypes';

const propTypes = {
    // Toggles the hamburger menu open and closed
    onLinkClick: PropTypes.func.isRequired,

    // Safe area insets required for mobile devices margins
    insets: SafeAreaInsetPropTypes.isRequired,
};

class SidebarView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isSidebarBottomVisible: true,
        };
    }

    render() {
        return (
            <View style={[styles.flex1, styles.sidebar]}>
                <SidebarLinks
                    onLinkClick={this.props.onLinkClick}
                    insets={this.props.insets}
                    onChatSwitcherFocus={() => this.setState({isSidebarBottomVisible: false})}
                    onChatSwitcherBlur={() => this.setState({isSidebarBottomVisible: true})}
                />
                {this.state.isSidebarBottomVisible && <SidebarBottom insets={this.props.insets} />}
            </View>
        );
    }
}

SidebarView.propTypes = propTypes;

export default SidebarView;
