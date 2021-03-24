import React from 'react';
import {View, Pressable} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
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
import {getReportParticipantsTitle} from '../../libs/reportUtils';
import OptionRowTitle from './sidebar/OptionRowTitle';
import {getPersonalDetailsForLogins} from '../../libs/OptionsListUtils';
import {participantPropTypes} from './sidebar/optionPropTypes';

const propTypes = {
    // Toggles the navigationMenu open and closed
    onNavigationMenuButtonClicked: PropTypes.func.isRequired,

    /* Onyx Props */
    // The report currently being looked at
    report: PropTypes.shape({
        // Name of the report
        reportName: PropTypes.string,

        // List of primarylogins of participants of the report
        participants: PropTypes.arrayOf(PropTypes.string),

        // ID of the report
        reportID: PropTypes.number,

        // Value indicating if the report is pinned or not
        isPinned: PropTypes.bool,
    }),

    // Personal details of all the users
    personalDetails: PropTypes.objectOf(participantPropTypes).isRequired,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    report: null,
};

const HeaderView = (props) => {
    const participants = lodashGet(props.report, 'participants', []);
    const reportOption = {
        text: lodashGet(props.report, 'reportName', ''),
        tooltipText: getReportParticipantsTitle(participants),
        participantsList: getPersonalDetailsForLogins(participants, props.personalDetails),
    };

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
                {props.report && props.report.reportName && (
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
                                if (participants.length === 1) {
                                    Navigation.navigate(ROUTES.getDetailsRoute(participants[0]));
                                }
                            }}
                            style={[styles.flexRow, styles.alignItemsCenter, styles.flex1]}
                        >
                            <MultipleAvatars avatarImageURLs={props.report.icons} />
                            <View style={[styles.flex1, styles.flexRow]}>
                                <OptionRowTitle
                                    option={reportOption}
                                    tooltipEnabled
                                    numberOfLines={2}
                                    style={[styles.headerText]}
                                />
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
                )}
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
        report: {
            key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
        },
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
    }),
)(HeaderView);
