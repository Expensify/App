import React from 'react';
import {View, Pressable} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import Header from '../../components/Header';
import styles from '../../styles/styles';
import ONYXKEYS from '../../ONYXKEYS';
import themeColors from '../../styles/themes/default';
import Icon from '../../components/Icon';
import {BackArrow, Pin} from '../../components/Icon/Expensicons';
import compose from '../../libs/compose';
import {togglePinnedState} from '../../libs/actions/Report';

const propTypes = {
    // Toggles the navigationMenu open and closed
    onNavigationMenuButtonClicked: PropTypes.func.isRequired,

    // Decides whether we should show the navigationMenu button
    shouldShowNavigationMenuButton: PropTypes.bool.isRequired,

    // Report ID currently being looked at, use to retrieve more information about the report.
    // eslint-disable-next-line react/no-unused-prop-types
    reportID: PropTypes.string.isRequired,

    /* Onyx Props */
    // The report currently being looked at
    report: PropTypes.shape({
        // Name of the report
        reportName: PropTypes.string,

        // ID of the report
        reportID: PropTypes.number,

        // Value indicating if the report is pinned or not
        isPinned: PropTypes.bool,
    }),
};

const defaultProps = {
    report: null,
};

const HeaderView = props => (
    <View style={[styles.appContentHeader]}>
        <View style={[styles.appContentHeaderTitle, !props.shouldShowNavigationMenuButton && styles.pl5]}>
            {props.shouldShowNavigationMenuButton && (
                <Pressable
                    onPress={props.onNavigationMenuButtonClicked}
                    style={[styles.LHNToggle]}
                >
                    <Icon src={BackArrow} />
                </Pressable>
            )}
            {props.report && props.report.reportName ? (
                <View
                    style={[
                        styles.flex1,
                        styles.flexRow,
                        styles.alignItemsCenter,
                        styles.justifyContentBetween,
                    ]}
                >
                    <Header title={props.report.reportName} />
                    <View style={[styles.reportOptions, styles.flexRow]}>
                        <Pressable
                            onPress={() => togglePinnedState(props.report)}
                            style={[styles.touchableButtonImage, styles.mr0]}
                        >
                            <Icon src={Pin} fill={props.report.isPinned ? themeColors.heading : themeColors.icon} />
                        </Pressable>
                    </View>
                </View>
            ) : null}
        </View>
    </View>
);

HeaderView.propTypes = propTypes;
HeaderView.displayName = 'HeaderView';
HeaderView.defaultProps = defaultProps;

export default compose(
    withOnyx({
        report: {
            key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
        },
    }),
)(HeaderView);
