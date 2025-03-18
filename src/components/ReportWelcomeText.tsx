import React, {useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {getPersonalDetailsForAccountIDs} from '@libs/OptionsListUtils';
import {getPolicy} from '@libs/PolicyUtils';
import {
    getDisplayNameForParticipant,
    getDisplayNamesWithTooltips,
    getParticipantsAccountIDsForDisplay,
    getPolicyName,
    getReportName,
    isAdminRoom as isAdminRoomReportUtils,
    isArchivedNonExpenseReport,
    isChatRoom as isChatRoomReportUtils,
    isConciergeChatReport,
    isInvoiceRoom as isInvoiceRoomReportUtils,
    isOptimisticPersonalDetail,
    isPolicyExpenseChat as isPolicyExpenseChatReportUtils,
    isSelfDM as isSelfDMReportUtils,
    isSystemChat as isSystemChatReportUtils,
    temporary_getMoneyRequestOptions,
} from '@libs/ReportUtils';
import SidebarUtils from '@libs/SidebarUtils';
import CONST from '@src/CONST';
import type {IOUType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy, Report} from '@src/types/onyx';
import RenderHTML from './RenderHTML';
import Text from './Text';
import UserDetailsTooltip from './UserDetailsTooltip';

type ReportWelcomeTextProps = {
    /** The report currently being looked at */
    report: OnyxEntry<Report>;

    /** The policy for the current route */
    policy: OnyxEntry<Policy>;
};

function ReportWelcomeText({report, policy}: ReportWelcomeTextProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const isPolicyExpenseChat = isPolicyExpenseChatReportUtils(report);
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID || undefined}`);
    const isArchivedRoom = isArchivedNonExpenseReport(report, reportNameValuePairs);
    const isChatRoom = isChatRoomReportUtils(report);
    const isSelfDM = isSelfDMReportUtils(report);
    const isInvoiceRoom = isInvoiceRoomReportUtils(report);
    const isSystemChat = isSystemChatReportUtils(report);
    const isAdminRoom = isAdminRoomReportUtils(report);
    const isDefault = !(isChatRoom || isPolicyExpenseChat || isSelfDM || isInvoiceRoom || isSystemChat);
    const participantAccountIDs = getParticipantsAccountIDsForDisplay(report, undefined, true, true);
    const isMultipleParticipant = participantAccountIDs.length > 1;
    const displayNamesWithTooltips = getDisplayNamesWithTooltips(getPersonalDetailsForAccountIDs(participantAccountIDs, personalDetails), isMultipleParticipant);
    const welcomeMessage = SidebarUtils.getWelcomeMessage(report, policy);
    const moneyRequestOptions = temporary_getMoneyRequestOptions(report, policy, participantAccountIDs);

    const filteredOptions = moneyRequestOptions.filter(
        (item): item is Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND | typeof CONST.IOU.TYPE.CREATE | typeof CONST.IOU.TYPE.INVOICE> =>
            item !== CONST.IOU.TYPE.INVOICE,
    );
    const additionalText = filteredOptions
        .map(
            (item, index) =>
                `${index === filteredOptions.length - 1 && index > 0 ? `${translate('common.or')} ` : ''}${translate(
                    item === 'submit' ? `reportActionsView.create` : `reportActionsView.iouTypes.${item}`,
                )}`,
        )
        .join(', ');
    const reportName = getReportName(report);
    const shouldShowUsePlusButtonText =
        (moneyRequestOptions.includes(CONST.IOU.TYPE.PAY) ||
            moneyRequestOptions.includes(CONST.IOU.TYPE.SUBMIT) ||
            moneyRequestOptions.includes(CONST.IOU.TYPE.TRACK) ||
            moneyRequestOptions.includes(CONST.IOU.TYPE.SPLIT)) &&
        !isPolicyExpenseChat &&
        !isAdminRoom;

    const navigateToReport = () => {
        if (!report?.reportID) {
            return;
        }

        Navigation.navigate(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(report.reportID, Navigation.getReportRHPActiveRoute()));
    };

    const welcomeHeroText = useMemo(() => {
        if (isInvoiceRoom) {
            return translate('reportActionsView.sayHello');
        }

        if (isChatRoom) {
            return translate('reportActionsView.welcomeToRoom', {roomName: reportName});
        }

        if (isSelfDM) {
            return translate('reportActionsView.yourSpace');
        }

        if (isSystemChat) {
            return reportName;
        }

        return translate('reportActionsView.sayHello');
    }, [isChatRoom, isInvoiceRoom, isSelfDM, isSystemChat, translate, reportName]);

    return (
        <>
            <View>
                <Text style={[styles.textHero]}>{welcomeHeroText}</Text>
            </View>
            <View style={[styles.mt3, styles.mw100]}>
                {isPolicyExpenseChat &&
                    (welcomeMessage?.messageHtml ? (
                        <View style={[styles.renderHTML, styles.cursorText]}>
                            <RenderHTML html={welcomeMessage.messageHtml} />
                        </View>
                    ) : (
                        <Text>
                            <Text>{welcomeMessage.phrase1}</Text>
                            <Text style={[styles.textStrong]}>{getDisplayNameForParticipant({accountID: report?.ownerAccountID})}</Text>
                            <Text>{welcomeMessage.phrase2}</Text>
                            <Text style={[styles.textStrong]}>{getPolicyName({report})}</Text>
                            <Text>{welcomeMessage.phrase3}</Text>
                        </Text>
                    ))}
                {isInvoiceRoom &&
                    !isArchivedRoom &&
                    (welcomeMessage?.messageHtml ? (
                        <View style={[styles.renderHTML, styles.cursorText]}>
                            <RenderHTML html={welcomeMessage.messageHtml} />
                        </View>
                    ) : (
                        <Text>
                            <Text>{welcomeMessage.phrase1}</Text>
                            <Text>
                                {report?.invoiceReceiver?.type === CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL ? (
                                    <Text style={[styles.textStrong]}>{getDisplayNameForParticipant({accountID: report?.invoiceReceiver?.accountID})}</Text>
                                ) : (
                                    <Text style={[styles.textStrong]}>{getPolicy(report?.invoiceReceiver?.policyID)?.name}</Text>
                                )}
                            </Text>
                            <Text>{` ${translate('common.and')} `}</Text>
                            <Text style={[styles.textStrong]}>{getPolicyName({report})}</Text>
                            <Text>{welcomeMessage.phrase2}</Text>
                        </Text>
                    ))}
                {isChatRoom &&
                    ((!isInvoiceRoom && !isAdminRoom) || isArchivedRoom) &&
                    (welcomeMessage?.messageHtml ? (
                        <View style={styles.renderHTML}>
                            <RenderHTML html={welcomeMessage.messageHtml} />
                        </View>
                    ) : (
                        <Text>
                            <Text>{welcomeMessage.phrase1}</Text>
                            {welcomeMessage.showReportName && (
                                <Text
                                    style={[styles.textStrong]}
                                    onPress={navigateToReport}
                                    suppressHighlighting
                                >
                                    {getReportName(report)}
                                </Text>
                            )}
                            {welcomeMessage.phrase2 !== undefined && <Text>{welcomeMessage.phrase2}</Text>}
                        </Text>
                    ))}
                {isChatRoom && isAdminRoom && !isArchivedRoom && (
                    <Text>
                        <Text>{welcomeMessage.phrase1}</Text>
                        {welcomeMessage.phrase2 !== undefined && <Text style={styles.textStrong}>{welcomeMessage.phrase2}</Text>}
                        {welcomeMessage.phrase3 !== undefined && <Text>{welcomeMessage.phrase3}</Text>}
                        {welcomeMessage.phrase4 !== undefined && <Text>{welcomeMessage.phrase4}</Text>}
                    </Text>
                )}
                {isSelfDM && (
                    <Text>
                        <Text>{welcomeMessage.phrase1}</Text>
                    </Text>
                )}
                {isSystemChat && (
                    <Text>
                        <Text>{welcomeMessage.phrase1}</Text>
                    </Text>
                )}
                {isDefault && displayNamesWithTooltips.length > 0 && (
                    <Text>
                        <Text>{welcomeMessage.phrase1}</Text>
                        {displayNamesWithTooltips.map(({displayName, accountID}, index) => (
                            // eslint-disable-next-line react/no-array-index-key
                            <Text key={`${displayName}${index}`}>
                                <UserDetailsTooltip accountID={accountID}>
                                    {isOptimisticPersonalDetail(accountID) ? (
                                        <Text style={[styles.textStrong]}>{displayName}</Text>
                                    ) : (
                                        <Text
                                            style={[styles.textStrong]}
                                            onPress={() => Navigation.navigate(ROUTES.PROFILE.getRoute(accountID, Navigation.getReportRHPActiveRoute()))}
                                            suppressHighlighting
                                        >
                                            {displayName}
                                        </Text>
                                    )}
                                </UserDetailsTooltip>
                                {index === displayNamesWithTooltips.length - 1 && <Text>.</Text>}
                                {index === displayNamesWithTooltips.length - 2 && <Text>{` ${translate('common.and')} `}</Text>}
                                {index < displayNamesWithTooltips.length - 2 && <Text>, </Text>}
                            </Text>
                        ))}
                    </Text>
                )}
                {shouldShowUsePlusButtonText && <Text>{translate('reportActionsView.usePlusButton', {additionalText})}</Text>}
                {isConciergeChatReport(report) && <Text>{translate('reportActionsView.askConcierge')}</Text>}
            </View>
        </>
    );
}

ReportWelcomeText.displayName = 'ReportWelcomeText';

export default ReportWelcomeText;
