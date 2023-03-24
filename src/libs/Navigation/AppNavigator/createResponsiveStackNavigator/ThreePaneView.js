import * as React from 'react';
import _ from 'underscore';
import {
    View, Pressable, StyleSheet,
} from 'react-native';
import SCREENS from '../../../../SCREENS';
import themeColors from '../../../../styles/themes/default';
import NAVIGATORS from '../../../../NAVIGATORS';

const RIGHT_PANEL_WIDTH = 375;
const LEFT_PANEL_WIDTH = 350;

// TODO-NR what to do with styles
const styles = StyleSheet.create({
    container: {flexDirection: 'row', flex: 1},
    leftPanelContainer: {
        flex: 1,
        maxWidth: LEFT_PANEL_WIDTH,
        borderRightWidth: 1,

        // TODO-NR maybe in different place?
        borderRightColor: themeColors.border,
    },
    centralPanelContainer: {flex: 1},
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

        // TODO-NR chagne default color for cards
        backgroundColor: 'black',
        width: '100%',
        height: '100%',
    },
});

// TODO-NR prop types

const displayIfTrue = condition => ({display: condition ? 'flex' : 'none'});

const WideView = (props) => {
    const lastCentralPaneIndex = _.findLastIndex(props.state.routes, {name: NAVIGATORS.CENTRAL_PANE_NAVIGATOR});

    const renderRightPanel = ({key, shouldDisplay, children}) => (
        <View
            key={key}
            style={[
                styles.rightPanelContainer,
                displayIfTrue(shouldDisplay),
            ]}
        >
            <Pressable style={{flex: 1}} onPress={() => props.navigation.goBack()} />
            <View
                style={styles.rightPanelInnerContainer}
            >
                {children}
            </View>
        </View>
    );

    // TODO-NR do we need some more wrapping for descriptor rendering?

    return (
        <View style={styles.container}>
            {_.map(props.state.routes, (route, i) => {
                if (route.name === SCREENS.HOME) {
                    return (
                        <View key={route.key} style={styles.leftPanelContainer}>
                            {props.descriptors[route.key].render()}
                        </View>
                    );
                } if (route.name === NAVIGATORS.CENTRAL_PANE_NAVIGATOR) {
                    return (
                        <View
                            key={route.key}
                            style={[
                                styles.centralPanelContainer,
                                displayIfTrue(lastCentralPaneIndex === i),
                            ]}
                        >
                            {props.descriptors[route.key].render()}
                        </View>
                    );
                } if (route.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR) {
                    return renderRightPanel({
                        key: route.key,
                        shouldDisplay: props.state.index === i,
                        children: props.descriptors[route.key].render(),
                    });
                }
                return (
                    <View key={route.key} style={styles.fullScreen}>
                        {props.descriptors[route.key].render()}
                    </View>
                );
            })}
        </View>
    );
};

export default WideView;
