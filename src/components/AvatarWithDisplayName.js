import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import reportPropTypes from '@pages/reportPropTypes';
import * as StyleUtils from '@styles/StyleUtils';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import DisplayNames from './DisplayNames';
import MultipleAvatars from './MultipleAvatars';
import ParentNavigationSubtitle from './ParentNavigationSubtitle';
import participantPropTypes from './participantPropTypes';
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';
import SubscriptAvatar from './SubscriptAvatar';
import Text from './Text';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';

const propTypes = {
    /** The report currently being looked at */
    report: reportPropTypes,

    /** The policy which the user has access to and which the report is tied to */
    policy: PropTypes.shape({
        /** Name of the policy */
        name: PropTypes.string,
    }),

    /** The size of the avatar */
    size: PropTypes.oneOf(_.values(CONST.AVATAR_SIZE)),

    /** Personal details of all the users */
    personalDetails: PropTypes.objectOf(participantPropTypes),

    /** Whether if it's an unauthenticated user */
    isAnonymous: PropTypes.bool,

    shouldEnableDetailPageNavigation: PropTypes.bool,

    ...windowDimensionsPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
    personalDetails: {},
    policy: {},
    report: {},
    isAnonymous: false,
    size: CONST.AVATAR_SIZE.DEFAULT,
    shouldEnableDetailPageNavigation: false,
};

const showActorDetails = (report, shouldEnableDetailPageNavigation = false) => {
    // We should navigate to the details page if the report is a IOU/expense report
    if (shouldEnableDetailPageNavigation) {
        return ReportUtils.navigateToDetailsPage(report);
    }

    if (ReportUtils.isExpenseReport(report)) {
        Navigation.navigate(ROUTES.PROFILE.getRoute(report.ownerAccountID));
        return;
    }

    if (ReportUtils.isIOUReport(report)) {
        Navigation.navigate(ROUTES.REPORT_PARTICIPANTS.getRoute(report.reportID));
        return;
    }

    if (ReportUtils.isChatThread(report)) {
        const parentReportAction = ReportActionsUtils.getParentReportAction(report);
        const actorAccountID = lodashGet(parentReportAction, 'actorAccountID', -1);
        // in an ideal situation account ID won't be 0
        if (actorAccountID > 0) {
            Navigation.navigate(ROUTES.PROFILE.getRoute(actorAccountID));
            return;
        }
    }

    // report detail route is added as fallback but based on the current implementation this route won't be executed
    Navigation.navigate(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(report.reportID));
};

function AvatarWithDisplayName(props) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const title = ReportUtils.getReportName(props.report);
    const subtitle = ReportUtils.getChatRoomSubtitle(props.report);
    const parentNavigationSubtitleData = ReportUtils.getParentNavigationSubtitle(props.report);
    const isMoneyRequestOrReport = ReportUtils.isMoneyRequestReport(props.report) || ReportUtils.isMoneyRequest(props.report);
    const icons = ReportUtils.getIcons(props.report, props.personalDetails, props.policy);
    const ownerPersonalDetails = OptionsListUtils.getPersonalDetailsForAccountIDs([props.report.ownerAccountID], props.personalDetails);
    const displayNamesWithTooltips = ReportUtils.getDisplayNamesWithTooltips(_.values(ownerPersonalDetails), false);
    const shouldShowSubscriptAvatar = ReportUtils.shouldReportShowSubscript(props.report);
    const isExpenseRequest = ReportUtils.isExpenseRequest(props.report);
    const defaultSubscriptSize = isExpenseRequest ? CONST.AVATAR_SIZE.SMALL_NORMAL : props.size;
    const avatarBorderColor = props.isAnonymous ? theme.highlightBG : theme.componentBG;

    const headerView = (
        <View style={[styles.appContentHeaderTitle, styles.flex1]}>
            {Boolean(props.report && title) && (
                <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween]}>
                    <PressableWithoutFeedback
                        onPress={() => showActorDetails(props.report, props.shouldEnableDetailPageNavigation)}
                        accessibilityLabel={title}
                        role={CONST.ACCESSIBILITY_ROLE.BUTTON}
                    >
                        {shouldShowSubscriptAvatar ? (
                            <SubscriptAvatar
                                backgroundColor={avatarBorderColor}
                                mainAvatar={icons[0]}
                                secondaryAvatar={icons[1]}
                                size={defaultSubscriptSize}
                            />
                        ) : (
                            <MultipleAvatars
                                icons={icons}
                                size={props.size}
                                secondAvatarStyle={[StyleUtils.getBackgroundAndBorderStyle(avatarBorderColor)]}
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

    if (!props.shouldEnableDetailPageNavigation) {
        return headerView;
    }

    return (
        <PressableWithoutFeedback
            onPress={() => ReportUtils.navigateToDetailsPage(props.report)}
            style={[styles.flexRow, styles.alignItemsCenter, styles.flex1]}
            accessibilityLabel={title}
            role={CONST.ACCESSIBILITY_ROLE.BUTTON}
        >
            {headerView}
        </PressableWithoutFeedback>
    );
}
AvatarWithDisplayName.propTypes = propTypes;
AvatarWithDisplayName.displayName = 'AvatarWithDisplayName';
AvatarWithDisplayName.defaultProps = defaultProps;

export default compose(withWindowDimensions, withLocalize)(AvatarWithDisplayName);
