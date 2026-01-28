import reportsSelector from '@selectors/Attributes';
import React, {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';
import type {ColorValue, StyleProp, TextStyle, ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {getPersonalDetailsForAccountIDs} from '@libs/OptionsListUtils';
import type {DisplayNameWithTooltips} from '@libs/ReportUtils';
import {
    getChatRoomSubtitle,
    getDisplayNamesWithTooltips,
    getParentNavigationSubtitle,
    getReportName,
    getReportStatusColorStyle,
    getReportStatusTranslation,
    isChatThread,
    isExpenseReport,
    isInvoiceReport,
    isIOUReport,
    isMoneyRequest,
    isMoneyRequestReport,
    isTrackExpenseReport,
    navigateToDetailsPage,
} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Report} from '@src/types/onyx';
import {getButtonRole} from './Button/utils';
import DisplayNames from './DisplayNames';
import type DisplayNamesProps from './DisplayNames/types';
import ParentNavigationSubtitle from './ParentNavigationSubtitle';
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';
import ReportActionAvatars from './ReportActionAvatars';
import type {TransactionListItemType} from './SelectionListWithSections/types';
import Text from './Text';

type AvatarWithDisplayNameProps = {
    /** The report currently being looked at */
    report: OnyxEntry<Report>;

    /** The size of the avatar */
    size?: ValueOf<typeof CONST.AVATAR_SIZE>;

    /** Whether if it's an unauthenticated user */
    isAnonymous?: boolean;

    /** Whether we should enable detail page navigation */
    shouldEnableDetailPageNavigation?: boolean;

    /** Whether the avatar is pressable to open the actor details */
    shouldEnableAvatarNavigation?: boolean;

    /** Whether we should enable custom title logic designed for search lis */
    shouldUseCustomSearchTitleName?: boolean;

    /** Whether we should display the status of the report */
    shouldDisplayStatus?: boolean;

    /** Transactions inside report */
    transactions?: TransactionListItemType[];

    /** Whether to open the parent report link in the current tab if possible */
    openParentReportInCurrentTab?: boolean;

    /** Color of the secondary avatar border, usually should match the container background */
    avatarBorderColor?: ColorValue;

    /** The style of the custom display name text */
    customDisplayNameStyle?: TextStyle;

    /** The style of the parent navigation subtitle text */
    parentNavigationSubtitleTextStyles?: StyleProp<TextStyle>;

    /** The style of the parent navigation status container */
    parentNavigationStatusContainerStyles?: StyleProp<ViewStyle>;
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
    report,
    isAnonymous = false,
    size = CONST.AVATAR_SIZE.DEFAULT,
    shouldEnableDetailPageNavigation = false,
    shouldEnableAvatarNavigation = true,
    shouldUseCustomSearchTitleName = false,
    transactions = [],
    openParentReportInCurrentTab = false,
    avatarBorderColor: avatarBorderColorProp,
    shouldDisplayStatus = false,
    customDisplayNameStyle = {},
    parentNavigationSubtitleTextStyles,
    parentNavigationStatusContainerStyles = {},
}: AvatarWithDisplayNameProps) {
    const {localeCompare, formatPhoneNumber} = useLocalize();
    const [parentReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.parentReportID}`, {canEvict: false, canBeMissing: !report?.parentReportID});
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false}) ?? CONST.EMPTY_OBJECT;
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`, {canBeMissing: true});
    const [invoiceReceiverPolicy] = useOnyx(
        `${ONYXKEYS.COLLECTION.POLICY}${parentReport?.invoiceReceiver && 'policyID' in parentReport.invoiceReceiver ? parentReport.invoiceReceiver.policyID : undefined}`,
        {canBeMissing: true},
    );
    const [reportAttributes] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {selector: reportsSelector, canBeMissing: true});
    const parentReportActionParam = report?.parentReportActionID ? parentReportActions?.[report.parentReportActionID] : undefined;
    const isReportArchived = useReportIsArchived(report?.reportID);
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const title = getReportName(report, undefined, parentReportActionParam, personalDetails, invoiceReceiverPolicy, reportAttributes, undefined, isReportArchived);
    const isParentReportArchived = useReportIsArchived(report?.parentReportID);
    const subtitle = getChatRoomSubtitle(report, true, isReportArchived);
    const parentNavigationSubtitleData = getParentNavigationSubtitle(report, isParentReportArchived, reportAttributes);
    const isMoneyRequestOrReport = isMoneyRequestReport(report) || isMoneyRequest(report) || isTrackExpenseReport(report) || isInvoiceReport(report);
    const ownerPersonalDetails = getPersonalDetailsForAccountIDs(report?.ownerAccountID ? [report.ownerAccountID] : [], personalDetails);
    const displayNamesWithTooltips = getDisplayNamesWithTooltips(Object.values(ownerPersonalDetails), false, localeCompare, formatPhoneNumber);
    const avatarBorderColor = avatarBorderColorProp ?? (isAnonymous ? theme.highlightBG : theme.componentBG);
    const statusText = shouldDisplayStatus ? getReportStatusTranslation({stateNum: report?.stateNum, statusNum: report?.statusNum, translate}) : undefined;
    const reportStatusColorStyle = shouldDisplayStatus ? getReportStatusColorStyle(theme, report?.stateNum, report?.statusNum) : {};

    const actorAccountID = useRef<number | null>(null);
    useEffect(() => {
        if (!report?.parentReportActionID) {
            return;
        }
        const parentReportAction = parentReportActions?.[report?.parentReportActionID];
        actorAccountID.current = parentReportAction?.actorAccountID ?? CONST.DEFAULT_NUMBER_ID;
    }, [parentReportActions, report?.parentReportActionID]);

    const goToDetailsPage = useCallback(() => {
        navigateToDetailsPage(report, Navigation.getActiveRoute());
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

    const multipleAvatars = (
        <ReportActionAvatars
            singleAvatarContainerStyle={[styles.actionAvatar, styles.mr3]}
            subscriptAvatarBorderColor={avatarBorderColor}
            size={size}
            secondaryAvatarContainerStyle={StyleUtils.getBackgroundAndBorderStyle(avatarBorderColor)}
            reportID={report?.reportID}
        />
    );

    const headerView = (
        <View style={[styles.appContentHeaderTitle, styles.flex1]}>
            {!!report && !!title && (
                <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween]}>
                    <View accessibilityLabel={title}>
                        {shouldEnableAvatarNavigation ? (
                            <PressableWithoutFeedback
                                onPress={showActorDetails}
                                accessibilityLabel={title}
                                role={getButtonRole(true)}
                            >
                                {multipleAvatars}
                            </PressableWithoutFeedback>
                        ) : (
                            multipleAvatars
                        )}
                    </View>

                    <View style={[styles.flex1, styles.flexColumn]}>
                        {getCustomDisplayName(
                            shouldUseCustomSearchTitleName,
                            report,
                            title,
                            displayNamesWithTooltips,
                            transactions,
                            shouldUseFullTitle,
                            [styles.headerText, styles.pre, customDisplayNameStyle],
                            [isAnonymous ? styles.headerAnonymousFooter : styles.headerText, styles.pre],
                            isAnonymous,
                            isMoneyRequestOrReport,
                        )}
                        {Object.keys(parentNavigationSubtitleData).length > 0 && (
                            <ParentNavigationSubtitle
                                parentNavigationSubtitleData={parentNavigationSubtitleData}
                                reportID={report?.reportID}
                                parentReportID={report?.parentReportID}
                                parentReportActionID={report?.parentReportActionID}
                                pressableStyles={[styles.alignSelfStart, styles.mw100]}
                                openParentReportInCurrentTab={openParentReportInCurrentTab}
                                statusText={statusText}
                                textStyles={parentNavigationSubtitleTextStyles}
                                statusTextContainerStyles={parentNavigationStatusContainerStyles}
                                statusTextColor={reportStatusColorStyle?.textColor}
                                statusTextBackgroundColor={reportStatusColorStyle?.backgroundColor}
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

export default AvatarWithDisplayName;
