import React, {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';
import {OnyxCollection, OnyxEntry, withOnyx} from 'react-native-onyx';
import {ValueOf} from 'type-fest';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {PersonalDetails, Policy, Report, ReportActions} from '@src/types/onyx';
import DisplayNames from './DisplayNames';
import MultipleAvatars from './MultipleAvatars';
import ParentNavigationSubtitle from './ParentNavigationSubtitle';
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';
import SubscriptAvatar from './SubscriptAvatar';
import Text from './Text';

type AvatarWithDisplayNamePropsWithOnyx = {
    /** All of the actions of the report */
    parentReportActions: OnyxEntry<ReportActions>;
};

type AvatarWithDisplayNameProps = AvatarWithDisplayNamePropsWithOnyx & {
    /** The report currently being looked at */
    report: OnyxEntry<Report>;

    /** The policy which the user has access to and which the report is tied to */
    policy?: OnyxEntry<Policy>;

    /** The size of the avatar */
    size?: ValueOf<typeof CONST.AVATAR_SIZE>;

    /** Personal details of all the users */
    personalDetails: OnyxCollection<PersonalDetails>;

    /** Whether if it's an unauthenticated user */
    isAnonymous?: boolean;

    /** Whether we should enable detail page navigation */
    shouldEnableDetailPageNavigation?: boolean;
};

function AvatarWithDisplayName({
    personalDetails,
    policy,
    report,
    parentReportActions,
    isAnonymous = false,
    size = CONST.AVATAR_SIZE.DEFAULT,
    shouldEnableDetailPageNavigation = false,
}: AvatarWithDisplayNameProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const title = ReportUtils.getReportName(report);
    const subtitle = ReportUtils.getChatRoomSubtitle(report);
    const parentNavigationSubtitleData = ReportUtils.getParentNavigationSubtitle(report);
    const isMoneyRequestOrReport = ReportUtils.isMoneyRequestReport(report) || ReportUtils.isMoneyRequest(report);
    const icons = ReportUtils.getIcons(report, personalDetails, null, '', -1, policy);
    const ownerPersonalDetails = OptionsListUtils.getPersonalDetailsForAccountIDs(report?.ownerAccountID ? [report.ownerAccountID] : [], personalDetails);
    const displayNamesWithTooltips = ReportUtils.getDisplayNamesWithTooltips(Object.values(ownerPersonalDetails), false);
    const shouldShowSubscriptAvatar = ReportUtils.shouldReportShowSubscript(report);
    const isExpenseRequest = ReportUtils.isExpenseRequest(report);
    const defaultSubscriptSize = isExpenseRequest ? CONST.AVATAR_SIZE.SMALL_NORMAL : size;
    const avatarBorderColor = isAnonymous ? theme.highlightBG : theme.componentBG;

    const actorAccountID = useRef<number | null>(null);
    useEffect(() => {
        const parentReportAction = parentReportActions?.[report?.parentReportActionID ?? ''];
        actorAccountID.current = parentReportAction?.actorAccountID ?? -1;
    }, [parentReportActions, report]);

    const showActorDetails = useCallback(() => {
        // We should navigate to the details page if the report is a IOU/expense report
        if (shouldEnableDetailPageNavigation) {
            return ReportUtils.navigateToDetailsPage(report);
        }

        if (ReportUtils.isExpenseReport(report) && report?.ownerAccountID) {
            Navigation.navigate(ROUTES.PROFILE.getRoute(report.ownerAccountID));
            return;
        }

        if (ReportUtils.isIOUReport(report) && report?.reportID) {
            Navigation.navigate(ROUTES.REPORT_PARTICIPANTS.getRoute(report.reportID));
            return;
        }

        if (ReportUtils.isChatThread(report)) {
            // In an ideal situation account ID won't be 0
            if (actorAccountID.current && actorAccountID.current > 0) {
                Navigation.navigate(ROUTES.PROFILE.getRoute(actorAccountID.current));
                return;
            }
        }

        if (report?.reportID) {
            // Report detail route is added as fallback but based on the current implementation this route won't be executed
            Navigation.navigate(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(report.reportID));
        }
    }, [report, shouldEnableDetailPageNavigation]);

    const headerView = (
        <View style={[styles.appContentHeaderTitle, styles.flex1]}>
            {report && !!title && (
                <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween]}>
                    <PressableWithoutFeedback
                        onPress={showActorDetails}
                        accessibilityLabel={title}
                        role={CONST.ROLE.BUTTON}
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
                        {Object.keys(parentNavigationSubtitleData).length > 0 && (
                            <ParentNavigationSubtitle
                                parentNavigationSubtitleData={parentNavigationSubtitleData}
                                parentReportID={report?.parentReportID}
                            />
                        )}
                        {!!subtitle && (
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
            role={CONST.ROLE.BUTTON}
        >
            {headerView}
        </PressableWithoutFeedback>
    );
}

AvatarWithDisplayName.displayName = 'AvatarWithDisplayName';

export default withOnyx<AvatarWithDisplayNameProps, AvatarWithDisplayNamePropsWithOnyx>({
    parentReportActions: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report ? report.parentReportID : '0'}`,
        canEvict: false,
    },
})(AvatarWithDisplayName);
