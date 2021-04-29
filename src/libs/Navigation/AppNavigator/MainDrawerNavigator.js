import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {withOnyx} from 'react-native-onyx';

import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import FullScreenLoadingIndicator from '../../../components/FullscreenLoadingIndicator';
import styles, {
    getNavigationDrawerType,
    getNavigationDrawerStyle,
} from '../../../styles/styles';
import ONYXKEYS from '../../../ONYXKEYS';
import compose from '../../compose';
import SCREENS from '../../../SCREENS';

// Screens
import SidebarScreen from '../../../pages/home/sidebar/SidebarScreen';
import ReportScreen from '../../../pages/home/ReportScreen';

const propTypes = {
    // Initial report to be used if nothing else is specified by routing
    initialReportID: PropTypes.string,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    initialReportID: null,
};

const Drawer = createDrawerNavigator();

class MainDrawerNavigator extends React.Component {
    constructor(props) {
        super(props);
        this.shouldMountReportScreen = _.isString(props.initialReportID);
    }

    shouldComponentUpdate(nextProps) {
        // Once the report screen is mounted we don't unmount it
        if (!this.shouldMountReportScreen) {
            this.shouldMountReportScreen = _.isString(nextProps.initialReportID);

            if (this.shouldMountReportScreen) {
                return true;
            }
        }

        // Re-render the component only for these changes
        const shouldUpdateForProps = ['windowWidth', 'isSmallScreenWidth'];

        const areEqual = _.isEqual(
            _.pick(this.props, ...shouldUpdateForProps),
            _.pick(nextProps, ...shouldUpdateForProps),
        );

        return !areEqual;
    }

    render() {
        return (
            <Drawer.Navigator
                openByDefault
                drawerType={getNavigationDrawerType(this.props.isSmallScreenWidth)}
                drawerStyle={getNavigationDrawerStyle(
                    this.props.windowWidth,
                    this.props.isSmallScreenWidth,
                )}
                sceneContainerStyle={styles.navigationSceneContainer}
                edgeWidth={500}
                drawerContent={() => <SidebarScreen />}
                screenOptions={{
                    cardStyle: styles.navigationScreenCardStyle,
                    headerShown: false,
                }}
            >
                {
                    this.shouldMountReportScreen
                        ? (
                            <Drawer.Screen
                                name={SCREENS.REPORT}
                                component={ReportScreen}
                                initialParams={{reportID: this.props.initialReportID}}
                            />
                        )
                        : (
                            <Drawer.Screen name={SCREENS.LOADING}>
                                {() => <FullScreenLoadingIndicator visible />}
                            </Drawer.Screen>
                        )
                }
            </Drawer.Navigator>
        );
    }
}

MainDrawerNavigator.propTypes = propTypes;
MainDrawerNavigator.defaultProps = defaultProps;
export default compose(
    withWindowDimensions,
    withOnyx({
        initialReportID: {
            key: ONYXKEYS.CURRENTLY_VIEWED_REPORTID,
        },
    }),
)(MainDrawerNavigator);
