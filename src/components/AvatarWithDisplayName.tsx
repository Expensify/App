import React, {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx, withOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {PersonalDetailsList, Policy, Report, ReportActions} from '@src/types/onyx';
import type {Icon} from '@src/types/onyx/OnyxCommon';
import CaretWrapper from './CaretWrapper';
import DisplayNames from './DisplayNames';
import {FallbackAvatar} from './Icon/Expensicons';
import MultipleAvatars from './MultipleAvatars';
import ParentNavigationSubtitle from './ParentNavigationSubtitle';
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';
import SubscriptAvatar from './SubscriptAvatar';
import Text from './Text';

type AvatarWithDisplayNamePropsWithOnyx = {
    /** All of the actions of the report */
    parentReportActions: OnyxEntry<ReportActions>;

    /** Personal details of all users */
    personalDetails: OnyxEntry<PersonalDetailsList>;
};

type AvatarWithDisplayNameProps = AvatarWithDisplayNamePropsWithOnyx & {
    /** The report currently being looked at */
    report: OnyxEntry<Report>;

    /** The policy which the user has access to and which the report is tied to */
    policy?: OnyxEntry<Policy>;

    /** The size of the avatar */
    size?: ValueOf<typeof CONST.AVATAR_SIZE>;

    /** Whether if it's an unauthenticated user */
    isAnonymous?: boolean;

    /** Whether we should enable detail page navigation */
    shouldEnableDetailPageNavigation?: boolean;
};

const fallbackIcon: Icon = {
    source: FallbackAvatar,
    type: CONST.ICON_TYPE_AVATAR,
    name: '',
    id: -1,
};

function AvatarWithDisplayName({
    policy,
    report,
    parentReportActions,
    isAnonymous = false,
    size = CONST.AVATAR_SIZE.DEFAULT,
    shouldEnableDetailPageNavigation = false,
    personalDetails = CONST.EMPTY_OBJECT,
}: AvatarWithDisplayNameProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`);
    const [invoiceReceiverPolicy] = useOnyx(
        `${ONYXKEYS.COLLECTION.POLICY}${parentReport?.invoiceReceiver && 'policyID' in parentReport.invoiceReceiver ? parentReport.invoiceReceiver.policyID : -1}`,
    );
    const title = ReportUtils.getReportName(report, undefined, undefined, undefined, invoiceReceiverPolicy);
    const subtitle = ReportUtils.getChatRoomSubtitle(report);
    const parentNavigationSubtitleData = ReportUtils.getParentNavigationSubtitle(report);
    const isMoneyRequestOrReport =
        ReportUtils.isMoneyRequestReport(report) || ReportUtils.isMoneyRequest(report) || ReportUtils.isTrackExpenseReport(report) || ReportUtils.isInvoiceReport(report);
    const icons = ReportUtils.getIcons(report, personalDetails, null, '', -1, policy, invoiceReceiverPolicy);
    const ownerPersonalDetails = OptionsListUtils.getPersonalDetailsForAccountIDs(report?.ownerAccountID ? [report.ownerAccountID] : [], personalDetails);
    const displayNamesWithTooltips = ReportUtils.getDisplayNamesWithTooltips(Object.values(ownerPersonalDetails), false);
    const shouldShowSubscriptAvatar = ReportUtils.shouldReportShowSubscript(report);
    const avatarBorderColor = isAnonymous ? theme.highlightBG : theme.componentBG;

    const actorAccountID = useRef<number | null>(null);
    useEffect(() => {
        const parentReportAction = parentReportActions?.[report?.parentReportActionID];
        actorAccountID.current = parentReportAction?.actorAccountID;
    }, [parentReportActions, report]);

    const goToDetailsPage = useCallback(() => {
        ReportUtils.navigateToDetailsPage(report, Navigation.getReportRHPActiveRoute());
    }, [report]);

    const showActorDetails = useCallback(() => {
        // We should navigate to the details page if the report is a IOU/expense report
        if (shouldEnableDetailPageNavigation) {
            goToDetailsPage();
            return;
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
    }, [report, shouldEnableDetailPageNavigation, goToDetailsPage]);

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
                                mainAvatar={icons.at(0) ?? fallbackIcon}
                                secondaryAvatar={icons.at(1)}
                                size={size}
                            />
                        ) : (
                            <MultipleAvatars
                                icons={icons}
                                size={size}
                                secondAvatarStyle={[StyleUtils.getBackgroundAndBorderStyle(avatarBorderColor)]}
                            />
                        )}
                    </PressableWithoutFeedback>
                    <View style={[styles.flex1, styles.flexColumn]}>
                        <CaretWrapper>
                            <DisplayNames
                                fullTitle={title}
                                displayNamesWithTooltips={displayNamesWithTooltips}
                                tooltipEnabled
                                numberOfLines={1}
                                textStyles={[isAnonymous ? styles.headerAnonymousFooter : styles.headerText, styles.pre]}
                                shouldUseFullTitle={isMoneyRequestOrReport || isAnonymous}
                            />
                        </CaretWrapper>
                        {Object.keys(parentNavigationSubtitleData).length > 0 && (
                            <ParentNavigationSubtitle
                                parentNavigationSubtitleData={parentNavigationSubtitleData}
                                parentReportID={report?.parentReportID}
                                parentReportActionID={report?.parentReportActionID}
                                pressableStyles={[styles.alignSelfStart, styles.mw100]}
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
            onPress={goToDetailsPage}
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
        key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report ? report.parentReportID : undefined}`,
        canEvict: false,
    },
    personalDetails: {
        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    },
})(AvatarWithDisplayName);
