import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import SidebarBottom from './SidebarBottom';
import SidebarLinks from './SidebarLinks';
import SafeAreaInsetPropTypes from '../../SafeAreaInsetPropTypes';
import KeyboardShortcut from '../../../libs/KeyboardShortcut';
import * as ChatSwitcher from '../../../libs/actions/ChatSwitcher';

const propTypes = {
    // Toggles the hamburger menu open and closed
    onLinkClick: PropTypes.func.isRequired,

    // Safe area insets required for mobile devices margins
    insets: SafeAreaInsetPropTypes.isRequired,

    // when the chat switcher is selected
    isChatSwitcherActive: PropTypes.bool,
};

const defaultProps = {
    isChatSwitcherActive: false,
};

class SidebarView extends React.Component {
    componentDidMount() {
        KeyboardShortcut.subscribe('K', () => {
            ChatSwitcher.show();
        }, ['meta'], true);
    }

    componentWillUnmount() {
        KeyboardShortcut.unsubscribe('K');
    }

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
SidebarView.defaultProps = defaultProps;
export default SidebarView;
