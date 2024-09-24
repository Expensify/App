import React, {useMemo} from 'react';
import {View, StyleProp, TextStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {getCurrentUserAccountID} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as ReportUtils from '@libs/ReportUtils';
import SidebarUtils from '@libs/SidebarUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {PersonalDetailsList, Policy, Report} from '@src/types/onyx';
import {PressableWithoutFeedback} from './Pressable';
import RenderHTML from './RenderHTML';
import Text from './Text';
import UserDetailsTooltip from './UserDetailsTooltip';

type ReportWelcomeTextOnyxProps = {
    /** All of the personal details for everyone */
    personalDetails: OnyxEntry<PersonalDetailsList>;
};

type ReportWelcomeTextProps = ReportWelcomeTextOnyxProps & {
    /** The report currently being looked at */
    report: OnyxEntry<Report>;

    /** The policy for the current route */
    policy: OnyxEntry<Policy>;
};

type RoomDescriptionProps = {
    /** On press event */
    onPress: () => void;

    /** Styles */
    style: StyleProp<TextStyle>[];
};

function ReportWelcomeText({report, policy, personalDetails}: ReportWelcomeTextProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const isArchivedRoom = ReportUtils.isArchivedRoom(report);
    const isPolicyExpenseChat = ReportUtils.isPolicyExpenseChat(report);
    const isSelfDM = ReportUtils.isSelfDM(report);
    const isInvoiceRoom = ReportUtils.isInvoiceRoom(report);
    const isSystemChat = ReportUtils.isSystemChat(report);
    const isAdminRoom = ReportUtils.isAdminRoom(report);
    const isAnnounceRoom = ReportUtils.isAnnounceRoom(report);
    const isDomainRoom = ReportUtils.isDomainRoom(report);
    const isSpecialRoom = isAdminRoom || isAnnounceRoom || isDomainRoom || isInvoiceRoom;
    const isChatRoom = ReportUtils.isChatRoom(report);
    const isDefaultChatRoom = isChatRoom && !isSpecialRoom;
    const isDefault = !(isChatRoom || isPolicyExpenseChat || isSelfDM || isSystemChat || isSpecialRoom);
    const participantAccountIDs = ReportUtils.getParticipantsAccountIDsForDisplay(report);
    const isMultipleParticipant = participantAccountIDs.length > 1;
    const currentUserAccountID = getCurrentUserAccountID();
    const otherParticipantAccountIDs = participantAccountIDs.filter(e => e !== currentUserAccountID);
    const displayNamesWithTooltips = ReportUtils.getDisplayNamesWithTooltips(OptionsListUtils.getPersonalDetailsForAccountIDs(otherParticipantAccountIDs, personalDetails), isMultipleParticipant);
    const welcomeMessage = SidebarUtils.getWelcomeMessage(report, policy);
    const moneyRequestOptions = ReportUtils.temporary_getMoneyRequestOptions(report, policy, participantAccountIDs);
    const additionalText = !isPolicyExpenseChat && ReportUtils.getMoneyRequestOptionsText(moneyRequestOptions);
    const canEditPolicyDescription = ReportUtils.canEditPolicyDescription(policy);
    const reportName = ReportUtils.getReportName(report);
    const reportDisplayName = (!(isDefaultChatRoom || isDomainRoom) || isArchivedRoom || isAdminRoom || isAnnounceRoom) ? 
        ReportUtils.getPolicyName(report) : ReportUtils.getReportName(report);
    const ownerAccountID = policy?.ownerAccountID || report?.ownerAccountID;

    const navigateToReport = () => {
        if (!report?.reportID) {
            return;
        }

        Navigation.navigate(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(report.reportID));
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

    const RoomDescription = (props: RoomDescriptionProps) => (
        <PressableWithoutFeedback
            {...props}
            accessibilityLabel={translate('reportDescriptionPage.roomDescription')}
        >
            <RenderHTML html={welcomeMessage.messageHtml} />
        </PressableWithoutFeedback>
    );

    const roomOnPress = () => {
        if (ReportUtils.canEditReportDescription(report, policy)) {
            Navigation.navigate(ROUTES.REPORT_DESCRIPTION.getRoute(report?.reportID ?? '-1'));
            return;
        }
        Navigation.navigate(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(report?.reportID ?? '-1'));
    };

    return (
        <>
            <View>
                <Text style={[styles.textHero]}>{welcomeHeroText}</Text>
            </View>
            <View style={[styles.mt3, styles.mw100]}>
                {isPolicyExpenseChat && (
                    <Text>
                        <Text>{welcomeMessage.phrase1}</Text>
                        <Text style={[styles.textStrong]}>{ReportUtils.getDisplayNameForParticipant(ownerAccountID)}</Text>
                        <Text>{welcomeMessage.phrase2}</Text>
                        <Text style={[styles.textStrong]}>{reportDisplayName}</Text>
                        <Text>{welcomeMessage.phrase3}</Text>
                    </Text>
                )}
                {isDefaultChatRoom && (
                    <Text>
                        <Text>{welcomeMessage.phrase1}</Text>
                        {welcomeMessage.showReportName && (
                            <Text
                                style={[styles.textStrong]}
                                onPress={navigateToReport}
                                suppressHighlighting
                            >
                                {reportDisplayName}
                            </Text>
                        )}
                        {welcomeMessage.phrase2 && <Text>{welcomeMessage.phrase2}</Text>}
                        {!isArchivedRoom && <Text style={[styles.textStrong]}>{ReportUtils.getDisplayNameForParticipant(ownerAccountID)}</Text>}
                        {welcomeMessage.phrase3 && <Text>{welcomeMessage.phrase3}</Text>}
                    </Text>
                )}
                {isSelfDM && (
                    <Text>
                        <Text>{welcomeMessage.phrase1}</Text>
                    </Text>
                )}
                {(isAdminRoom || isAnnounceRoom) && (
                    <Text>
                        <Text>{welcomeMessage.phrase1}</Text>   
                        <Text style={[styles.textStrong]}>{reportDisplayName}</Text>
                        <Text>{welcomeMessage.phrase2}</Text>                    
                    </Text>
                )}
                {isDomainRoom && (
                    <Text>
                        <Text>{welcomeMessage.phrase1}</Text>   
                        <Text style={[styles.textStrong]}>{reportDisplayName}</Text>
                        <Text>{welcomeMessage.phrase2}</Text>                    
                    </Text>
                )}
                {isInvoiceRoom && (isArchivedRoom ? (
                    <Text>
                        <Text>{welcomeMessage.phrase1}</Text>   
                        <Text style={[styles.textStrong]}>{reportDisplayName}</Text>
                        <Text>{welcomeMessage.phrase2}</Text>  
                    </Text>
                ) : (
                    <Text>
                        <Text>{welcomeMessage.phrase1}</Text>   
                        <Text style={[styles.textStrong]}>{ReportUtils.getDisplayNameForParticipant(ownerAccountID)}</Text>
                        <Text>{welcomeMessage.phrase2}</Text>  
                        <Text style={[styles.textStrong]}>{ReportUtils.getDisplayNameForParticipant(report?.invoiceReceiver?.accountID)}</Text>
                        <Text>{welcomeMessage.phrase3}</Text>                 
                    </Text>
                ))}
                {isSystemChat && (
                    <Text>
                        <Text>{welcomeMessage.phrase1}</Text>                       
                    </Text>
                )}
                {isDefault && (
                    <Text>
                        <Text>{welcomeMessage.phrase1}</Text>
                        {displayNamesWithTooltips.map(({displayName, accountID}, index) => (
                            // eslint-disable-next-line react/no-array-index-key
                            <Text key={`${displayName}${index}`}>
                                <UserDetailsTooltip accountID={accountID}>
                                    {ReportUtils.isOptimisticPersonalDetail(accountID) ? (
                                        <Text style={[styles.textStrong]}>{displayName}</Text>
                                    ) : (
                                        <Text
                                            style={[styles.textStrong]}
                                            onPress={() => Navigation.navigate(ROUTES.PROFILE.getRoute(accountID))}
                                            suppressHighlighting
                                        >
                                            {displayName}
                                        </Text>
                                    )}
                                </UserDetailsTooltip>
                                {index === displayNamesWithTooltips.length - 1}
                                {index === displayNamesWithTooltips.length - 2 && <Text>{` ${translate('common.and')} `}</Text>}
                                {index < displayNamesWithTooltips.length - 2 && <Text>, </Text>}
                            </Text>
                        ))}
                        <Text>{welcomeMessage.phrase2}</Text>
                        {welcomeMessage.phrase3 && <Text>{welcomeMessage.phrase3}</Text>}
                    </Text>
                )}
                {(!isChatRoom || isInvoiceRoom) && 
                 (moneyRequestOptions.includes(CONST.IOU.TYPE.PAY) || 
                  moneyRequestOptions.includes(CONST.IOU.TYPE.SUBMIT) || 
                  moneyRequestOptions.includes(CONST.IOU.TYPE.TRACK) || 
                  moneyRequestOptions.includes(CONST.IOU.TYPE.SPLIT) || 
                  moneyRequestOptions.includes(CONST.IOU.TYPE.INVOICE)) && (
                    <Text>{translate('reportActionsView.usePlusButton', {additionalText, type: isInvoiceRoom ? report?.chatType : undefined} )}</Text>
                )}
            </View>
        </>
    );
}

ReportWelcomeText.displayName = 'ReportWelcomeText';

export default withOnyx<ReportWelcomeTextProps, ReportWelcomeTextOnyxProps>({
    personalDetails: {
        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    },
})(ReportWelcomeText);
