import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import SidebarBottom from './SidebarBottom';
import SidebarLinks from './SidebarLinks';
import SafeAreaInsetPropTypes from '../../SafeAreaInsetPropTypes';
import FAB from '../../../components/FAB';

const propTypes = {
  // Toggles the navigationMenu menu open and closed
  onLinkClick: PropTypes.func.isRequired,

  // Safe area insets required for mobile devices margins
  insets: SafeAreaInsetPropTypes.isRequired,

<<<<<<< HEAD
  // when the chat switcher is selected
  isChatSwitcherActive: PropTypes.bool,
=======
    // when the chat switcher is selected
    isChatSwitcherActive: PropTypes.bool,

    // Current state (active or not active) of the FAB
    isFloatingActionButtonActive: PropTypes.bool.isRequired,

    // Callback to fire on request to toggle the FAB
    onFloatingActionButtonPress: PropTypes.func.isRequired,
>>>>>>> 4a1923e6a0a3c737a83af68c5939a356fd8dbf82
};

const defaultProps = {
  isChatSwitcherActive: false,
};

<<<<<<< HEAD
const SidebarView = (props) => (
  <View style={[styles.flex1, styles.sidebar]}>
    <SidebarLinks
      onLinkClick={props.onLinkClick}
      insets={props.insets}
      isChatSwitcherActive={props.isChatSwitcherActive}
    />
    {!props.isChatSwitcherActive && <SidebarBottom insets={props.insets} />}
  </View>
=======
const SidebarView = props => (
    <View style={[styles.flex1, styles.sidebar]}>
        <SidebarLinks
            onLinkClick={props.onLinkClick}
            insets={props.insets}
            isChatSwitcherActive={props.isChatSwitcherActive}
        />
        {!props.isChatSwitcherActive && (
            <SidebarBottom insets={props.insets} />
        )}
        <FAB
            isActive={props.isFloatingActionButtonActive}
            onPress={props.onFloatingActionButtonPress}
            isHidden
        />
    </View>
>>>>>>> 4a1923e6a0a3c737a83af68c5939a356fd8dbf82
);

SidebarView.propTypes = propTypes;
SidebarView.defaultProps = defaultProps;
SidebarView.displayName = 'SidebarView';
export default SidebarView;
