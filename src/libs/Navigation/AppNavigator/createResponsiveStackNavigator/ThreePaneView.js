import * as React from 'react';
import _ from 'underscore';
import {
    View, Pressable, StyleSheet,
} from 'react-native';
import PropTypes from 'prop-types';
import SCREENS from '../../../../SCREENS';
import themeColors from '../../../../styles/themes/default';
import NAVIGATORS from '../../../../NAVIGATORS';
import * as StyleUtils from '../../../../styles/StyleUtils';
import {withNavigationPropTypes} from '../../../../components/withNavigation';
import styles from '../../../../styles/styles';

const RIGHT_PANEL_WIDTH = 375;
const LEFT_PANEL_WIDTH = 350;

// TODO-NR this has tobe removed
const localStyles = StyleSheet.create({
    leftPanelContainer: {
        flex: 1,
        maxWidth: LEFT_PANEL_WIDTH,
        borderRightWidth: 1,

        // TODO-NR maybe in different place?
        borderRightColor: themeColors.border,
    },
    rightPanelContainer: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        flexDirection: 'row',
    },
    rightPanelInnerContainer: {width: RIGHT_PANEL_WIDTH},
    fullScreen: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
    },
});

const propTypes = {
    /* State from useNavigationBuilder */
    // eslint-disable-next-line react/forbid-prop-types
    state: PropTypes.object.isRequired,

    /* Descriptors from useNavigationBuilder */
    // eslint-disable-next-line react/forbid-prop-types
    descriptors: PropTypes.object.isRequired,

    ...withNavigationPropTypes,
};

const ThreePaneView = (props) => {
    const lastCentralPaneIndex = _.findLastIndex(props.state.routes, {name: NAVIGATORS.CENTRAL_PANE_NAVIGATOR});

    return (
        <View style={[styles.flex1, styles.flexRow]}>
            {_.map(props.state.routes, (route, i) => {
                if (route.name === SCREENS.HOME) {
                    return (
                        <View key={route.key} style={localStyles.leftPanelContainer}>
                            {props.descriptors[route.key].render()}
                        </View>
                    );
                }
                if (route.name === NAVIGATORS.CENTRAL_PANE_NAVIGATOR) {
                    return (
                        <View
                            key={route.key}
                            style={[
                                styles.flex1,
                                StyleUtils.displayIfTrue(lastCentralPaneIndex === i),
                            ]}
                        >
                            {props.descriptors[route.key].render()}
                        </View>
                    );
                }
                if (route.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR) {
                    return (
                        <View
                            key={route.key}
                            style={[
                                localStyles.rightPanelContainer,
                                StyleUtils.displayIfTrue(props.state.index === i),
                            ]}
                        >
                            <Pressable style={[styles.flex1]} onPress={() => props.navigation.goBack()} />
                            <View
                                style={localStyles.rightPanelInnerContainer}
                            >
                                {props.descriptors[route.key].render()}
                            </View>
                        </View>
                    );
                }
                return (
                    <View key={route.key} style={localStyles.fullScreen}>
                        {props.descriptors[route.key].render()}
                    </View>
                );
            })}
        </View>
    );
};

ThreePaneView.propTypes = propTypes;
ThreePaneView.displayName = 'ThreePaneView';

export default ThreePaneView;
