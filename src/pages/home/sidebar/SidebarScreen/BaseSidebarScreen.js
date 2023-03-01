import React, {Component} from 'react';
import {View} from 'react-native';
import styles from '../../../../styles/styles';
import SidebarLinks from '../SidebarLinks';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import Navigation from '../../../../libs/Navigation/Navigation';
import ROUTES from '../../../../ROUTES';
import Timing from '../../../../libs/actions/Timing';
import CONST from '../../../../CONST';
import Performance from '../../../../libs/Performance';
import withDrawerState from '../../../../components/withDrawerState';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../../components/withWindowDimensions';
import compose from '../../../../libs/compose';
import sidebarPropTypes from './sidebarPropTypes';

const propTypes = {
    ...sidebarPropTypes,
    ...windowDimensionsPropTypes,
};

class BaseSidebarScreen extends Component {
    constructor(props) {
        super(props);

        this.startTimer = this.startTimer.bind(this);
        this.navigateToSettings = this.navigateToSettings.bind(this);
    }

    componentDidMount() {
        Performance.markStart(CONST.TIMING.SIDEBAR_LOADED);
        Timing.start(CONST.TIMING.SIDEBAR_LOADED, true);
    }

    /**
     * Method called when avatar is clicked
     */
    navigateToSettings() {
        Navigation.navigate(ROUTES.SETTINGS);
    }

    /**
     * Method called when a pinned chat is selected.
     */
    startTimer() {
        Timing.start(CONST.TIMING.SWITCH_REPORT);
        Performance.markStart(CONST.TIMING.SWITCH_REPORT);
    }

    render() {
        return (
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                style={[styles.sidebar]}
            >
                {({insets}) => (
                    <>
                        <View style={[styles.flex1]}>
                            <SidebarLinks
                                onLinkClick={this.startTimer}
                                insets={insets}
                                onAvatarClick={this.navigateToSettings}
                                isSmallScreenWidth={this.props.isSmallScreenWidth}
                                isDrawerOpen={this.props.isDrawerOpen}
                                reportIDFromRoute={this.props.reportIDFromRoute}
                                onLayout={this.props.onLayout}
                            />
                        </View>
                        {this.props.children}
                    </>
                )}
            </ScreenWrapper>
        );
    }
}

BaseSidebarScreen.propTypes = propTypes;

export default compose(
    withWindowDimensions,
    withDrawerState,
)(BaseSidebarScreen);
