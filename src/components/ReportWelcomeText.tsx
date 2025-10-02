import {createPersonalDetailsSelector} from '@selectors/PersonalDetails';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {getPersonalDetailsForAccountIDs} from '@libs/OptionsListUtils';
import {
    getDisplayNamesWithTooltips,
    getParticipantsAccountIDsForDisplay,
    getPolicyName,
    getReportName,
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
import TextWithEmojiFragment from '@pages/home/report/comment/TextWithEmojiFragment';
import CONST from '@src/CONST';
import type {IOUType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {OnyxInputOrEntry, PersonalDetails, PersonalDetailsList, Policy, Report} from '@src/types/onyx';
import RenderHTML from './RenderHTML';
import Text from './Text';
import UserDetailsTooltip from './UserDetailsTooltip';

type ReportWelcomeTextProps = {
    /** The report currently being looked at */
    report: OnyxEntry<Report>;

    /** The policy for the current route */
    policy: OnyxEntry<Policy>;
};

const personalDetailSelector = (personalDetail: OnyxInputOrEntry<PersonalDetails>): OnyxInputOrEntry<PersonalDetails> =>
    personalDetail && {
        accountID: personalDetail.accountID,
        login: personalDetail.login,
        avatar: personalDetail.avatar,
        pronouns: personalDetail.pronouns,
    };

const personalDetailsSelector = (personalDetail: OnyxEntry<PersonalDetailsList>) => createPersonalDetailsSelector(personalDetail, personalDetailSelector);

function ReportWelcomeText({report, policy}: ReportWelcomeTextProps) {
    const {translate, localeCompare} = useLocalize();
    const styles = useThemeStyles();
    const {environmentURL} = useEnvironment();
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsSelector, canBeMissing: false});
    const {isRestrictedToPreferredPolicy} = usePreferredPolicy();
    const isPolicyExpenseChat = isPolicyExpenseChatReportUtils(report);
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${report?.reportID || undefined}`, {canBeMissing: true});
    const isReportArchived = useReportIsArchived(report?.reportID);
    const isChatRoom = isChatRoomReportUtils(report);
    const isSelfDM = isSelfDMReportUtils(report);
    const isInvoiceRoom = isInvoiceRoomReportUtils(report);
    const isSystemChat = isSystemChatReportUtils(report);
    const isDefault = !(isChatRoom || isPolicyExpenseChat || isSelfDM || isSystemChat);
    const participantAccountIDs = getParticipantsAccountIDsForDisplay(report, undefined, true, true, reportMetadata);
    const isMultipleParticipant = participantAccountIDs.length > 1;
    const displayNamesWithTooltips = getDisplayNamesWithTooltips(
        getPersonalDetailsForAccountIDs(participantAccountIDs, personalDetails as OnyxInputOrEntry<PersonalDetailsList>),
        isMultipleParticipant,
        localeCompare,
    );
    const moneyRequestOptions = temporary_getMoneyRequestOptions(report, policy, participantAccountIDs, isReportArchived, isRestrictedToPreferredPolicy);
    const policyName = getPolicyName({report});

    const filteredOptions = moneyRequestOptions.filter(
        (
            item,
        ): item is Exclude<
            IOUType,
            typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND | typeof CONST.IOU.TYPE.CREATE | typeof CONST.IOU.TYPE.INVOICE | typeof CONST.IOU.TYPE.SPLIT_EXPENSE
        > => item !== CONST.IOU.TYPE.INVOICE,
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
        moneyRequestOptions.includes(CONST.IOU.TYPE.PAY) ||
        moneyRequestOptions.includes(CONST.IOU.TYPE.SUBMIT) ||
        moneyRequestOptions.includes(CONST.IOU.TYPE.TRACK) ||
        moneyRequestOptions.includes(CONST.IOU.TYPE.SPLIT);

    const reportDetailsLink = useMemo(() => {
        if (!report?.reportID) {
            return '';
        }

        return `${environmentURL}/${ROUTES.REPORT_WITH_ID_DETAILS.getRoute(report.reportID, Navigation.getReportRHPActiveRoute())}`;
    }, [environmentURL, report?.reportID]);

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

        if (isPolicyExpenseChat) {
            return translate('reportActionsView.welcomeToRoom', {roomName: policyName});
        }

        return translate('reportActionsView.sayHello');
    }, [isChatRoom, isInvoiceRoom, isPolicyExpenseChat, isSelfDM, isSystemChat, translate, policyName, reportName]);
    const participantAccountIDsExcludeCurrentUser = getParticipantsAccountIDsForDisplay(report, undefined, undefined, true);
    const participantPersonalDetailListExcludeCurrentUser = Object.values(
        getPersonalDetailsForAccountIDs(participantAccountIDsExcludeCurrentUser, personalDetails as OnyxInputOrEntry<PersonalDetailsList>),
    );
    const welcomeMessage = SidebarUtils.getWelcomeMessage(report, policy, participantPersonalDetailListExcludeCurrentUser, localeCompare, isReportArchived, reportDetailsLink);

    return (
        <>
            <View>
                <Text style={[styles.textHero]}>{welcomeHeroText}</Text>
            </View>
            <View style={[styles.mt3, styles.mw100]}>
                {(isChatRoom || isPolicyExpenseChat) && !!welcomeMessage.messageHtml && (
                    <View style={[styles.renderHTML, styles.cursorText]}>
                        <RenderHTML html={welcomeMessage.messageHtml} />
                    </View>
                )}
                {isSelfDM && (
                    <Text>
                        <Text>{welcomeMessage.messageText}</Text>
                        {shouldShowUsePlusButtonText && <TextWithEmojiFragment message={translate('reportActionsView.usePlusButton', {additionalText})} />}
                    </Text>
                )}
                {isSystemChat && (
                    <Text>
                        <Text>{welcomeMessage.messageText}</Text>
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
                                            onPress={() => Navigation.navigate(ROUTES.PROFILE.getRoute(accountID, Navigation.getActiveRoute()))}
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
                        {shouldShowUsePlusButtonText && <TextWithEmojiFragment message={translate('reportActionsView.usePlusButton', {additionalText})} />}
                        {isConciergeChatReport(report) && <Text>{translate('reportActionsView.askConcierge')}</Text>}
                    </Text>
                )}
            </View>
        </>
    );
}

ReportWelcomeText.displayName = 'ReportWelcomeText';

export default ReportWelcomeText;
