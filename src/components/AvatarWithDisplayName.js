import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as ReportUtils from '@libs/ReportUtils';
import reportActionPropTypes from '@pages/home/report/reportActionPropTypes';
import reportPropTypes from '@pages/reportPropTypes';
import * as StyleUtils from '@styles/StyleUtils';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import DisplayNames from './DisplayNames';
import MultipleAvatars from './MultipleAvatars';
import ParentNavigationSubtitle from './ParentNavigationSubtitle';
import participantPropTypes from './participantPropTypes';
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';
import SubscriptAvatar from './SubscriptAvatar';
import Text from './Text';

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

    /* Onyx Props */
    /** All of the actions of the report */
    parentReportActions: PropTypes.objectOf(PropTypes.shape(reportActionPropTypes)),
};

const defaultProps = {
    personalDetails: {},
    policy: {},
    report: {},
    parentReportActions: {},
    isAnonymous: false,
    size: CONST.AVATAR_SIZE.DEFAULT,
    shouldEnableDetailPageNavigation: false,
};

function AvatarWithDisplayName({report, policy, size, isAnonymous, parentReportActions, personalDetails, shouldEnableDetailPageNavigation}) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const title = ReportUtils.getReportName(report);
    const subtitle = ReportUtils.getChatRoomSubtitle(report);
    const parentNavigationSubtitleData = ReportUtils.getParentNavigationSubtitle(report);
    const isMoneyRequestOrReport = ReportUtils.isMoneyRequestReport(report) || ReportUtils.isMoneyRequest(report);
    const icons = ReportUtils.getIcons(report, personalDetails, policy);
    const ownerPersonalDetails = OptionsListUtils.getPersonalDetailsForAccountIDs([report.ownerAccountID], personalDetails);
    const displayNamesWithTooltips = ReportUtils.getDisplayNamesWithTooltips(_.values(ownerPersonalDetails), false);
    const shouldShowSubscriptAvatar = ReportUtils.shouldReportShowSubscript(report);
    const isExpenseRequest = ReportUtils.isExpenseRequest(report);
    const defaultSubscriptSize = isExpenseRequest ? CONST.AVATAR_SIZE.SMALL_NORMAL : size;
    const avatarBorderColor = isAnonymous ? theme.highlightBG : theme.componentBG;

    const actorAccountID = useRef(null);
    useEffect(() => {
        const parentReportAction = lodashGet(parentReportActions, [report.parentReportActionID], {});
        actorAccountID.current = lodashGet(parentReportAction, 'actorAccountID', -1);
    }, [parentReportActions, report]);

    const showActorDetails = useCallback(() => {
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
            // In an ideal situation account ID won't be 0
            if (actorAccountID.current > 0) {
                Navigation.navigate(ROUTES.PROFILE.getRoute(actorAccountID.current));
                return;
            }
        }

        // Report detail route is added as fallback but based on the current implementation this route won't be executed
        Navigation.navigate(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(report.reportID));
    }, [report, shouldEnableDetailPageNavigation]);

    const headerView = (
        <View style={[styles.appContentHeaderTitle, styles.flex1]}>
            {Boolean(report && title) && (
                <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween]}>
                    <PressableWithoutFeedback
                        onPress={showActorDetails}
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
                                size={size}
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
                            textStyles={[isAnonymous ? styles.headerAnonymousFooter : styles.headerText, styles.pre]}
                            shouldUseFullTitle={isMoneyRequestOrReport || isAnonymous}
                        />
                        {!_.isEmpty(parentNavigationSubtitleData) && (
                            <ParentNavigationSubtitle
                                parentNavigationSubtitleData={parentNavigationSubtitleData}
                                parentReportID={report.parentReportID}
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

    if (!shouldEnableDetailPageNavigation) {
        return headerView;
    }

    return (
        <PressableWithoutFeedback
            onPress={() => ReportUtils.navigateToDetailsPage(report)}
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

export default withOnyx({
    parentReportActions: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report ? report.parentReportID : '0'}`,
        canEvict: false,
    },
})(AvatarWithDisplayName);
