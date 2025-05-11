import React, {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';
import type {TextStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {getPersonalDetailsForAccountIDs} from '@libs/OptionsListUtils';
import type {DisplayNameWithTooltips} from '@libs/ReportUtils';
import {
    getChatRoomSubtitle,
    getDisplayNamesWithTooltips,
    getIcons,
    getParentNavigationSubtitle,
    getReportName,
    isChatThread,
    isExpenseReport,
    isInvoiceReport,
    isIOUReport,
    isMoneyRequest,
    isMoneyRequestReport,
    isTrackExpenseReport,
    navigateToDetailsPage,
    shouldReportShowSubscript,
} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy, Report} from '@src/types/onyx';
import type {Icon} from '@src/types/onyx/OnyxCommon';
import {getButtonRole} from './Button/utils';
import DisplayNames from './DisplayNames';
import type DisplayNamesProps from './DisplayNames/types';
import {FallbackAvatar} from './Icon/Expensicons';
import MultipleAvatars from './MultipleAvatars';
import ParentNavigationSubtitle from './ParentNavigationSubtitle';
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';
import type {TransactionListItemType} from './SelectionList/types';
import SubscriptAvatar from './SubscriptAvatar';
import Text from './Text';

type AvatarWithDisplayNameProps = {
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

    /** Whether we should enable custom title logic designed for search lis */
    shouldUseCustomSearchTitleName?: boolean;

    /** Transactions inside report */
    transactions?: TransactionListItemType[];
};

const fallbackIcon: Icon = {
    source: FallbackAvatar,
    type: CONST.ICON_TYPE_AVATAR,
    name: '',
    id: -1,
};

function getCustomDisplayName(
    shouldUseCustomSearchTitleName: boolean,
    report: OnyxEntry<Report>,
    title: string,
    displayNamesWithTooltips: DisplayNameWithTooltips,
    transactions: TransactionListItemType[],
    shouldUseFullTitle: boolean,
    customSearchDisplayStyle: TextStyle[],
    regularStyle: TextStyle[],
    isAnonymous: boolean,
    isMoneyRequestOrReport: boolean,
): React.ReactNode {
    const reportName = report?.reportName ?? CONST.REPORT.DEFAULT_REPORT_NAME;
    const isIOUOrInvoice = report?.type === CONST.REPORT.TYPE.IOU || report?.type === CONST.REPORT.TYPE.INVOICE;
    const hasTransactions = transactions.length > 0;

    function getDisplayProps(): DisplayNamesProps {
        const baseProps = {
            displayNamesWithTooltips,
            tooltipEnabled: true,
            numberOfLines: 1,
        };

        if (shouldUseCustomSearchTitleName) {
            const styleProps = {
                textStyles: customSearchDisplayStyle,
            };

            if (!hasTransactions) {
                return {
                    fullTitle: reportName,
                    shouldUseFullTitle,
                    ...baseProps,
                    ...styleProps,
                };
            }

            if (isIOUOrInvoice) {
                return {
                    fullTitle: title,
                    shouldUseFullTitle: true,
                    ...baseProps,
                    ...styleProps,
                };
            }

            return {
                fullTitle: reportName,
                shouldUseFullTitle,
                ...baseProps,
                ...styleProps,
            };
        }

        return {
            fullTitle: title,
            textStyles: regularStyle,
            shouldUseFullTitle: isMoneyRequestOrReport || isAnonymous,
            ...baseProps,
        };
    }

    const {fullTitle, textStyles, displayNamesWithTooltips: displayNamesWithTooltipsProp, tooltipEnabled, numberOfLines, shouldUseFullTitle: shouldUseFullTitleProp} = getDisplayProps();

    return (
        <DisplayNames
            fullTitle={fullTitle}
            displayNamesWithTooltips={displayNamesWithTooltipsProp}
            tooltipEnabled={tooltipEnabled}
            numberOfLines={numberOfLines}
            textStyles={textStyles}
            shouldUseFullTitle={shouldUseFullTitleProp}
        />
    );
}

function AvatarWithDisplayName({
    policy,
    report,
    isAnonymous = false,
    size = CONST.AVATAR_SIZE.DEFAULT,
    shouldEnableDetailPageNavigation = false,
    shouldUseCustomSearchTitleName = false,
    transactions = [],
}: AvatarWithDisplayNameProps) {
    const [parentReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.parentReportID}`, {canEvict: false, canBeMissing: false});
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false}) ?? CONST.EMPTY_OBJECT;
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`, {canBeMissing: true});
    const [invoiceReceiverPolicy] = useOnyx(
        `${ONYXKEYS.COLLECTION.POLICY}${parentReport?.invoiceReceiver && 'policyID' in parentReport.invoiceReceiver ? parentReport.invoiceReceiver.policyID : undefined}`,
        {canBeMissing: true},
    );
    const [reportAttributes] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {selector: (attributes) => attributes?.reports, canBeMissing: false});
    const title = getReportName(report, undefined, undefined, undefined, invoiceReceiverPolicy, reportAttributes);
    const subtitle = getChatRoomSubtitle(report, {isCreateExpenseFlow: true});
    const parentNavigationSubtitleData = getParentNavigationSubtitle(report);
    const isMoneyRequestOrReport = isMoneyRequestReport(report) || isMoneyRequest(report) || isTrackExpenseReport(report) || isInvoiceReport(report);
    const icons = getIcons(report, personalDetails, null, '', -1, policy, invoiceReceiverPolicy);
    const ownerPersonalDetails = getPersonalDetailsForAccountIDs(report?.ownerAccountID ? [report.ownerAccountID] : [], personalDetails);
    const displayNamesWithTooltips = getDisplayNamesWithTooltips(Object.values(ownerPersonalDetails), false);
    const shouldShowSubscriptAvatar = shouldReportShowSubscript(report);
    const avatarBorderColor = isAnonymous ? theme.highlightBG : theme.componentBG;

    const actorAccountID = useRef<number | null>(null);
    useEffect(() => {
        if (!report?.parentReportActionID) {
            return;
        }
        const parentReportAction = parentReportActions?.[report?.parentReportActionID];
        actorAccountID.current = parentReportAction?.actorAccountID ?? CONST.DEFAULT_NUMBER_ID;
    }, [parentReportActions, report]);

    const goToDetailsPage = useCallback(() => {
        navigateToDetailsPage(report, Navigation.getReportRHPActiveRoute());
    }, [report]);

    const showActorDetails = useCallback(() => {
        // We should navigate to the details page if the report is a IOU/expense report
        if (shouldEnableDetailPageNavigation) {
            goToDetailsPage();
            return;
        }

        if (isExpenseReport(report) && report?.ownerAccountID) {
            Navigation.navigate(ROUTES.PROFILE.getRoute(report.ownerAccountID));
            return;
        }

        if (isIOUReport(report) && report?.reportID) {
            Navigation.navigate(ROUTES.REPORT_PARTICIPANTS.getRoute(report.reportID));
            return;
        }

        if (isChatThread(report)) {
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
    const shouldUseFullTitle = isMoneyRequestOrReport || isAnonymous;
    const headerView = (
        <View style={[styles.appContentHeaderTitle, styles.flex1]}>
            {!!report && !!title && (
                <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween]}>
                    <PressableWithoutFeedback
                        onPress={showActorDetails}
                        accessibilityLabel={title}
                        role={getButtonRole(true)}
                    >
                        <View accessibilityLabel={title}>
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
                        </View>
                    </PressableWithoutFeedback>
                    <View style={[styles.flex1, styles.flexColumn]}>
                        {getCustomDisplayName(
                            shouldUseCustomSearchTitleName,
                            report,
                            title,
                            displayNamesWithTooltips,
                            transactions,
                            shouldUseFullTitle,
                            [styles.headerText, styles.pre],
                            [isAnonymous ? styles.headerAnonymousFooter : styles.headerText, styles.pre],
                            isAnonymous,
                            isMoneyRequestOrReport,
                        )}
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

export default AvatarWithDisplayName;
