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
import {redirect} from '../../libs/actions/App';
import ROUTES from '../../ROUTES';
import Tooltip from '../../components/Tooltip';
import {getReportParticipantsTitle} from '../../libs/reportUtils';

const propTypes = {
    // Toggles the navigationMenu open and closed
    onNavigationMenuButtonClicked: PropTypes.func.isRequired,

    /* Onyx Props */
    // The report currently being looked at
    report: PropTypes.shape({
        // Name of the report
        reportName: PropTypes.string,

        // list of primarylogins of participants of the report
        participants: PropTypes.arrayOf(PropTypes.string),

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

const HeaderView = (props) => {
    const participantsTitle = props.report && props.report.participants
        ? getReportParticipantsTitle(props.report.participants)
        : '';

    return (
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
                                    redirect(ROUTES.getProfileRoute(participants[0]));
                                }
                            }}
                        >
                            <MultipleAvatars avatarImageURLs={props.report.icons} />
                        </Pressable>
                        <View style={[styles.flex1, styles.flexRow]}>
                            <Tooltip text={participantsTitle}>
                                <Header title={props.report.reportName} />
                            </Tooltip>
                        </View>
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
};
HeaderView.propTypes = propTypes;
HeaderView.displayName = 'HeaderView';
HeaderView.defaultProps = defaultProps;

export default compose(
    withWindowDimensions,
    withOnyx({
        currentlyViewedReportID: {
            key: ONYXKEYS.CURRENTLY_VIEWED_REPORTID,
        },
    }),
    withOnyx({
        report: {
            key: ({currentlyViewedReportID}) => `${ONYXKEYS.COLLECTION.REPORT}${currentlyViewedReportID}`,
        },
    }),
)(HeaderView);
