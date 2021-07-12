import _ from 'underscore';
import React from 'react';
import {View, Pressable} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import Str from 'expensify-common/lib/str';
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
import DisplayNames from '../../components/DisplayNames';
import {getPersonalDetailsForLogins} from '../../libs/OptionsListUtils';
import {participantPropTypes} from './sidebar/optionPropTypes';
import VideoChatButtonAndMenu from '../../components/VideoChatButtonAndMenu';
import IOUBadge from '../../components/IOUBadge';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import CONST from '../../CONST';
import {getDefaultRoomSubtitle, isDefaultRoom} from '../../libs/reportUtils';
import Text from '../../components/Text';

const propTypes = {
    /** Toggles the navigationMenu open and closed */
    onNavigationMenuButtonClicked: PropTypes.func.isRequired,

    /* Onyx Props */

    /** The report currently being looked at */
    report: PropTypes.shape({
        /** Name of the report */
        reportName: PropTypes.string,

        /** List of primarylogins of participants of the report */
        participants: PropTypes.arrayOf(PropTypes.string),

        /** ID of the report */
        reportID: PropTypes.number,

        /** Value indicating if the report is pinned or not */
        isPinned: PropTypes.bool,
    }),

    /** The policies which the user has access to and which the report could be tied to */
    policies: PropTypes.shape({
        /** Name of the policy */
        name: PropTypes.string,
    }).isRequired,

    /** Personal details of all the users */
    personalDetails: PropTypes.objectOf(participantPropTypes).isRequired,

    ...windowDimensionsPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
    report: null,
};

const HeaderView = (props) => {
    const participants = lodashGet(props.report, 'participants', []);
    const isMultipleParticipant = participants.length > 1;
    const displayNamesWithTooltips = _.map(
        getPersonalDetailsForLogins(participants, props.personalDetails),
        ({displayName, firstName, login}) => {
            const displayNameTrimmed = Str.isSMSLogin(login) ? props.toLocalPhone(displayName) : displayName;

            return {
                displayName: (isMultipleParticipant ? firstName : displayNameTrimmed) || Str.removeSMSDomain(login),
                tooltip: Str.removeSMSDomain(login),
            };
        },
    );
    const isDefaultChatRoom = isDefaultRoom(props.report);
    const title = isDefaultChatRoom
        ? props.report.reportName
        : displayNamesWithTooltips.map(({displayName}) => displayName).join(', ');

    const subtitle = getDefaultRoomSubtitle(props.report, props.policies);
    const isConcierge = participants.length === 1 && participants.includes(CONST.EMAIL.CONCIERGE);

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
                                if (isDefaultRoom(props.report)) {
                                    return Navigation.navigate(ROUTES.getReportDetailsRoute(props.report.reportID));
                                }
                                if (participants.length === 1) {
                                    return Navigation.navigate(ROUTES.getDetailsRoute(participants[0]));
                                }
                                Navigation.navigate(ROUTES.getReportParticipantsRoute(props.reportID));
                            }}
                            style={[styles.flexRow, styles.alignItemsCenter, styles.flex1]}
                        >
                            <MultipleAvatars
                                avatarImageURLs={props.report.icons}
                                secondAvatarStyle={[styles.secondAvatarHovered]}
                            />
                            <View style={[styles.flex1, styles.flexColumn]}>
                                <DisplayNames
                                    fullTitle={title}
                                    displayNamesWithTooltips={displayNamesWithTooltips}
                                    tooltipEnabled
                                    numberOfLines={1}
                                    textStyles={[styles.headerText]}
                                    shouldUseFullTitle={isDefaultChatRoom}
                                />
                                {isDefaultChatRoom && (
                                    <Text
                                        style={[styles.sidebarLinkText, styles.optionAlternateText, styles.mt1]}
                                        numberOfLines={1}
                                    >
                                        {subtitle}
                                    </Text>
                                )}
                            </View>
                        </Pressable>
                        <View style={[styles.reportOptions, styles.flexRow, styles.alignItemsCenter]}>
                            {props.report.hasOutstandingIOU && (
                                <IOUBadge iouReportID={props.report.iouReportID} />
                            )}
                            <VideoChatButtonAndMenu isConcierge={isConcierge} />
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
    withLocalize,
    withOnyx({
        report: {
            key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
        },
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
        policies: {
            key: ONYXKEYS.COLLECTION.POLICY,
        },
    }),
)(HeaderView);
