import {createPersonalDetailsSelector} from '@selectors/PersonalDetails';
import React from 'react';
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
import {getReportName} from '@libs/ReportNameUtils';
import {
    getParticipantsAccountIDsForDisplay,
    getPolicyName,
    isChatRoom as isChatRoomReportUtils,
    isInvoiceRoom as isInvoiceRoomReportUtils,
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
import type {OnyxInputOrEntry, PersonalDetails, PersonalDetailsList, Policy, Report} from '@src/types/onyx';
import RenderHTML from './RenderHTML';
import Text from './Text';

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

    const reportDetailsLink = report?.reportID ? `${environmentURL}/${ROUTES.REPORT_WITH_ID_DETAILS.getRoute(report.reportID, Navigation.getReportRHPActiveRoute())}` : '';

    let welcomeHeroText = translate('reportActionsView.sayHello');
    if (isInvoiceRoom) {
        welcomeHeroText = translate('reportActionsView.sayHello');
    } else if (isChatRoom) {
        welcomeHeroText = translate('reportActionsView.welcomeToRoom', {roomName: reportName});
    } else if (isSelfDM) {
        welcomeHeroText = translate('reportActionsView.yourSpace');
    } else if (isSystemChat) {
        welcomeHeroText = reportName;
    } else if (isPolicyExpenseChat) {
        welcomeHeroText = translate('reportActionsView.welcomeToRoom', {roomName: policyName});
    }

    // If we are the only participant (e.g. solo group chat) then keep the current user personal details so the welcome message does not show up empty.
    const shouldExcludeCurrentUser = participantAccountIDs.length > 0;
    const participantAccountIDsExcludeCurrentUser = getParticipantsAccountIDsForDisplay(report, undefined, undefined, shouldExcludeCurrentUser);
    const participantPersonalDetailListExcludeCurrentUser = Object.values(
        getPersonalDetailsForAccountIDs(participantAccountIDsExcludeCurrentUser, personalDetails as OnyxInputOrEntry<PersonalDetailsList>),
    );
    const welcomeMessage = SidebarUtils.getWelcomeMessage(
        report,
        policy,
        participantPersonalDetailListExcludeCurrentUser,
        translate,
        localeCompare,
        isReportArchived,
        reportDetailsLink,
        shouldShowUsePlusButtonText,
        additionalText,
    );

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
                        {shouldShowUsePlusButtonText && <Text>{translate('reportActionsView.usePlusButton', {additionalText})}</Text>}
                    </Text>
                )}
                {isSystemChat && (
                    <Text>
                        <Text>{welcomeMessage.messageText}</Text>
                    </Text>
                )}
                {isDefault && !!welcomeMessage.messageHtml && <RenderHTML html={welcomeMessage.messageHtml} />}
            </View>
        </>
    );
}

export default ReportWelcomeText;
