import * as React from 'react';
import _ from 'underscore';
import {View, Pressable} from 'react-native';
import PropTypes from 'prop-types';
import SCREENS from '../../../../SCREENS';
import themeColors from '../../../../styles/themes/default';
import NAVIGATORS from '../../../../NAVIGATORS';
import * as StyleUtils from '../../../../styles/StyleUtils';
import {withNavigationPropTypes} from '../../../../components/withNavigation';
import styles from '../../../../styles/styles';
import CONST from '../../../../CONST';

const propTypes = {
    /* State from useNavigationBuilder */
    // eslint-disable-next-line react/forbid-prop-types
    state: PropTypes.object.isRequired,

    /* Descriptors from useNavigationBuilder */
    // eslint-disable-next-line react/forbid-prop-types
    descriptors: PropTypes.object.isRequired,

    ...withNavigationPropTypes,
};

function ThreePaneView(props) {
    const lastCentralPaneIndex = _.findLastIndex(props.state.routes, {name: NAVIGATORS.CENTRAL_PANE_NAVIGATOR});

    return (
        <View style={[styles.flex1, styles.flexRow]}>
            {_.map(props.state.routes, (route, i) => {
                if (route.name === SCREENS.HOME) {
                    return (
                        <View
                            key={route.key}
                            style={[styles.borderRight, styles.flex1, styles.leftPanelContainer]}
                        >
                            {props.descriptors[route.key].render()}
                        </View>
                    );
                }
                if (route.name === NAVIGATORS.CENTRAL_PANE_NAVIGATOR) {
                    return (
                        <View
                            key={route.key}
                            style={[styles.flex1, StyleUtils.displayIfTrue(lastCentralPaneIndex === i)]}
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
                                styles.flexRow,
                                styles.pAbsolute,
                                styles.w100,
                                styles.h100,
                                StyleUtils.getBackgroundColorWithOpacityStyle(themeColors.shadow, CONST.RIGHT_MODAL_BACKGROUND_OVERLAY_OPACITY),
                                StyleUtils.displayIfTrue(props.state.index === i),
                            ]}
                        >
                            <Pressable
                                style={[styles.flex1]}
                                onPress={() => props.navigation.goBack()}
                            />
                            <View style={styles.rightPanelContainer}>{props.descriptors[route.key].render()}</View>
                        </View>
                    );
                }
                return (
                    <View
                        key={route.key}
                        style={[styles.pAbsolute, styles.t0, styles.l0, styles.w100, styles.h100]}
                    >
                        {props.descriptors[route.key].render()}
                    </View>
                );
            })}
        </View>
    );
}

ThreePaneView.propTypes = propTypes;
ThreePaneView.displayName = 'ThreePaneView';

export default ThreePaneView;
