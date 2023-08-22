import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import PropTypes from 'prop-types';
import CONST from '../CONST';
import reportPropTypes from '../pages/reportPropTypes';
import participantPropTypes from './participantPropTypes';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import SubscriptAvatar from './SubscriptAvatar';
import * as ReportUtils from '../libs/ReportUtils';
import MultipleAvatars from './MultipleAvatars';
import DisplayNames from './DisplayNames';
import compose from '../libs/compose';
import * as OptionsListUtils from '../libs/OptionsListUtils';
import Text from './Text';
import * as StyleUtils from '../styles/StyleUtils';
import ParentNavigationSubtitle from './ParentNavigationSubtitle';
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';

const propTypes = {
    /** The report currently being looked at */
    report: reportPropTypes,

    /** The policies which the user has access to and which the report could be tied to */
    policies: PropTypes.shape({
        /** Name of the policy */
        name: PropTypes.string,
    }),

    /** The size of the avatar */
    size: PropTypes.oneOf(_.values(CONST.AVATAR_SIZE)),

    /** Personal details of all the users */
    personalDetails: PropTypes.objectOf(participantPropTypes),

    /** Whether if it's an unauthenticated user */
    isAnonymous: PropTypes.bool,

    ...windowDimensionsPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
    personalDetails: {},
    policies: {},
    report: {},
    isAnonymous: false,
    size: CONST.AVATAR_SIZE.DEFAULT,
};

const showActorDetails = (report) => {
    if (ReportUtils.isExpenseReport(report)) {
        Navigation.navigate(ROUTES.getProfileRoute(report.ownerAccountID));
        return;
    }

    if (!ReportUtils.isIOUReport(report) && report.participantAccountIDs.length === 1) {
        Navigation.navigate(ROUTES.getProfileRoute(report.participantAccountIDs[0]));
        return;
    }

    Navigation.navigate(ROUTES.getReportParticipantsRoute(report.reportID));
};

function AvatarWithDisplayName(props) {
    const title = ReportUtils.getReportName(props.report);
    const subtitle = ReportUtils.getChatRoomSubtitle(props.report);
    const parentNavigationSubtitleData = ReportUtils.getParentNavigationSubtitle(props.report);
    const isMoneyRequestOrReport = ReportUtils.isMoneyRequestReport(props.report) || ReportUtils.isMoneyRequest(props.report);
    const icons = ReportUtils.getIcons(props.report, props.personalDetails, props.policies, true);
    const ownerPersonalDetails = OptionsListUtils.getPersonalDetailsForAccountIDs([props.report.ownerAccountID], props.personalDetails);
    const displayNamesWithTooltips = ReportUtils.getDisplayNamesWithTooltips(_.values(ownerPersonalDetails), false);
    const shouldShowSubscriptAvatar = ReportUtils.shouldReportShowSubscript(props.report);
    const isExpenseRequest = ReportUtils.isExpenseRequest(props.report);
    const defaultSubscriptSize = isExpenseRequest ? CONST.AVATAR_SIZE.SMALL_NORMAL : props.size;

    return (
        <View style={[styles.appContentHeaderTitle, styles.flex1]}>
            {Boolean(props.report && title) && (
                <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween]}>
                    <PressableWithoutFeedback
                        onPress={() => showActorDetails(props.report)}
                        accessibilityLabel={title}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                    >
                        {shouldShowSubscriptAvatar ? (
                            <SubscriptAvatar
                                backgroundColor={themeColors.highlightBG}
                                mainAvatar={icons[0]}
                                secondaryAvatar={icons[1]}
                                size={defaultSubscriptSize}
                            />
                        ) : (
                            <MultipleAvatars
                                icons={icons}
                                size={props.size}
                                secondAvatarStyle={[StyleUtils.getBackgroundAndBorderStyle(themeColors.highlightBG)]}
                            />
                        )}
                    </PressableWithoutFeedback>
                    <View style={[styles.flex1, styles.flexColumn, shouldShowSubscriptAvatar && !isExpenseRequest ? styles.ml4 : {}]}>
                        <DisplayNames
                            fullTitle={title}
                            displayNamesWithTooltips={displayNamesWithTooltips}
                            tooltipEnabled
                            numberOfLines={1}
                            textStyles={[props.isAnonymous ? styles.headerAnonymousFooter : styles.headerText, styles.pre]}
                            shouldUseFullTitle={isMoneyRequestOrReport || props.isAnonymous}
                        />
                        {!_.isEmpty(parentNavigationSubtitleData) && (
                            <ParentNavigationSubtitle
                                parentNavigationSubtitleData={parentNavigationSubtitleData}
                                parentReportID={props.report.parentReportID}
                            />
                        )}
                        {!_.isEmpty(subtitle) && (
                            <Text
                                style={[styles.sidebarLinkText, styles.optionAlternateText, styles.textLabelSupporting, styles.pre]}
                                numberOfLines={1}
                            >
                                {subtitle}
                            </Text>
                        )}
                    </View>
                </View>
            )}
        </View>
    );
}
AvatarWithDisplayName.propTypes = propTypes;
AvatarWithDisplayName.displayName = 'AvatarWithDisplayName';
AvatarWithDisplayName.defaultProps = defaultProps;

export default compose(withWindowDimensions, withLocalize)(AvatarWithDisplayName);
