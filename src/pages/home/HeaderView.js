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
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';
import MultipleAvatars from '../../components/MultipleAvatars';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';

const propTypes = {
    // Toggles the navigationMenu open and closed
    onNavigationMenuButtonClicked: PropTypes.func.isRequired,

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

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    report: null,
};

const HeaderView = props => (
    <View style={[styles.appContentHeader]} nativeID="drag-area">
        <View style={[styles.appContentHeaderTitle, !props.isSmallScreenWidth && styles.pl5]}>
            {props.isSmallScreenWidth && (
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
                    <Pressable
                        onPress={() => {
                            const {participants} = props.report;
                            if (participants.length === 1) {
                                Navigation.navigate(ROUTES.getDetailsRoute(participants[0]));
                            }
                        }}
                    >
                        <View style={[styles.flexRow, styles.alignItemsCenter]}>
                            <MultipleAvatars avatarImageURLs={props.report.icons} />
                            <Header title={props.report.reportName} />
                        </View>
                    </Pressable>
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
    withWindowDimensions,
    withOnyx({
        report: {
            key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
        },
    }),
)(HeaderView);
