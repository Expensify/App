import React, {useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as ReportUtils from '@libs/ReportUtils';
import SidebarUtils from '@libs/SidebarUtils';
import CONST from '@src/CONST';
import type {IOUType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy, Report} from '@src/types/onyx';
import {PressableWithoutFeedback} from './Pressable';
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
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);

    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const isPolicyExpenseChat = ReportUtils.isPolicyExpenseChat(report);
    const isChatRoom = ReportUtils.isChatRoom(report);
    const isSelfDM = ReportUtils.isSelfDM(report);
    const isInvoiceRoom = ReportUtils.isInvoiceRoom(report);
    const isSystemChat = ReportUtils.isSystemChat(report);
    const isDefault = !(isChatRoom || isPolicyExpenseChat || isSelfDM || isInvoiceRoom || isSystemChat);
    const participantAccountIDs = ReportUtils.getParticipantsAccountIDsForDisplay(report);
    const isMultipleParticipant = participantAccountIDs.length > 1;
    const displayNamesWithTooltips = ReportUtils.getDisplayNamesWithTooltips(OptionsListUtils.getPersonalDetailsForAccountIDs(participantAccountIDs, personalDetails), isMultipleParticipant);
    const welcomeMessage = SidebarUtils.getWelcomeMessage(report, policy);
    const moneyRequestOptions = ReportUtils.temporary_getMoneyRequestOptions(report, policy, participantAccountIDs);
    const additionalText = moneyRequestOptions
        .filter((item): item is Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND | typeof CONST.IOU.TYPE.INVOICE> => item !== CONST.IOU.TYPE.INVOICE)
        .map((item) => translate(`reportActionsView.iouTypes.${item}`))
        .join(', ');
    const canEditPolicyDescription = ReportUtils.canEditPolicyDescription(policy);
    const reportName = ReportUtils.getReportName(report);

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

    return (
        <>
            <View>
                <Text style={[styles.textHero]}>{welcomeHeroText}</Text>
            </View>
            <View style={[styles.mt3, styles.mw100]}>
                {isPolicyExpenseChat &&
                    (welcomeMessage?.messageHtml ? (
                        <PressableWithoutFeedback
                            onPress={() => {
                                if (!canEditPolicyDescription) {
                                    return;
                                }
                                Navigation.navigate(ROUTES.WORKSPACE_PROFILE_DESCRIPTION.getRoute(policy?.id ?? '-1'));
                            }}
                            style={[styles.renderHTML, canEditPolicyDescription ? styles.cursorPointer : styles.cursorText]}
                            accessibilityLabel={translate('reportDescriptionPage.roomDescription')}
                        >
                            <RenderHTML html={welcomeMessage.messageHtml} />
                        </PressableWithoutFeedback>
                    ) : (
                        <Text>
                            <Text>{welcomeMessage.phrase1}</Text>
                            <Text style={[styles.textStrong]}>{ReportUtils.getDisplayNameForParticipant(report?.ownerAccountID)}</Text>
                            <Text>{welcomeMessage.phrase2}</Text>
                            <Text style={[styles.textStrong]}>{ReportUtils.getPolicyName(report)}</Text>
                            <Text>{welcomeMessage.phrase3}</Text>
                        </Text>
                    ))}
                {isChatRoom &&
                    (welcomeMessage?.messageHtml ? (
                        <PressableWithoutFeedback
                            onPress={() => {
                                if (ReportUtils.canEditReportDescription(report, policy)) {
                                    Navigation.navigate(ROUTES.REPORT_DESCRIPTION.getRoute(report?.reportID ?? '-1'));
                                    return;
                                }
                                Navigation.navigate(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(report?.reportID ?? '-1'));
                            }}
                            style={styles.renderHTML}
                            accessibilityLabel={translate('reportDescriptionPage.roomDescription')}
                        >
                            <RenderHTML html={welcomeMessage.messageHtml} />
                        </PressableWithoutFeedback>
                    ) : (
                        <Text>
                            <Text>{welcomeMessage.phrase1}</Text>
                            {welcomeMessage.showReportName && (
                                <Text
                                    style={[styles.textStrong]}
                                    onPress={navigateToReport}
                                    suppressHighlighting
                                >
                                    {ReportUtils.getReportName(report)}
                                </Text>
                            )}
                            {welcomeMessage.phrase2 !== undefined && <Text>{welcomeMessage.phrase2}</Text>}
                        </Text>
                    ))}
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
                                {index === displayNamesWithTooltips.length - 1 && <Text>.</Text>}
                                {index === displayNamesWithTooltips.length - 2 && <Text>{` ${translate('common.and')} `}</Text>}
                                {index < displayNamesWithTooltips.length - 2 && <Text>, </Text>}
                            </Text>
                        ))}
                    </Text>
                )}
                {(moneyRequestOptions.includes(CONST.IOU.TYPE.PAY) || moneyRequestOptions.includes(CONST.IOU.TYPE.SUBMIT) || moneyRequestOptions.includes(CONST.IOU.TYPE.TRACK)) && (
                    <Text>{translate('reportActionsView.usePlusButton', {additionalText})}</Text>
                )}
            </View>
        </>
    );
}

ReportWelcomeText.displayName = 'ReportWelcomeText';

export default ReportWelcomeText;
