import React from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import {View} from 'react-native';
import Button from '@components/Button';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {
    getMemberChangeMessageFragment,
    getOriginalMessage,
    getUpdateRoomDescriptionFragment,
    isMemberChangeAction,
    isMoneyRequestAction,
    isReimbursementDirectionInformationRequiredAction,
} from '@libs/ReportActionsUtils';
import {getReportName} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {ReportAction} from '@src/types/onyx';
import IouReportActionMessage from './actionContents/IouReportActionMessage';
import ReportActionMessageContent from './actionContents/ReportActionMessageContent';
import TextCommentFragment from './comment/TextCommentFragment';

type ReportActionItemMessageProps = {
    /** The report action */
    action: ReportAction;

    /** Should the comment have the appearance of being grouped with the previous comment? */
    displayAsGroup: boolean;

    /** Additional styles to add after local styles. */
    style?: StyleProp<ViewStyle & TextStyle>;

    /** Whether or not the message is hidden by moderation */
    isHidden?: boolean;

    /** The ID of the report */
    reportID: string | undefined;
};

function ReportActionItemMessage({action, displayAsGroup, reportID, style, isHidden = false}: ReportActionItemMessageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    if (isMoneyRequestAction(action)) {
        return (
            <IouReportActionMessage
                action={action}
                displayAsGroup={displayAsGroup}
                reportID={reportID}
                style={style}
                isHidden={isHidden}
            />
        );
    }

    if (isMemberChangeAction(action)) {
        // This will be fixed: https://github.com/Expensify/App/issues/76852
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        const fragment = getMemberChangeMessageFragment(translate, action, getReportName);

        return (
            <View style={[styles.chatItemMessage, style]}>
                <TextCommentFragment
                    fragment={fragment}
                    displayAsGroup={displayAsGroup}
                    style={style}
                    source=""
                    styleAsDeleted={false}
                />
            </View>
        );
    }

    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.UPDATE_ROOM_DESCRIPTION) {
        const fragment = getUpdateRoomDescriptionFragment(translate, action);
        return (
            <View style={[styles.chatItemMessage, style]}>
                <TextCommentFragment
                    fragment={fragment}
                    displayAsGroup={displayAsGroup}
                    style={style}
                    source=""
                    styleAsDeleted={false}
                />
            </View>
        );
    }

    const handleEnterSignerInfoPress = (policyID: string | undefined, bankAccountID: string | undefined, isCompleted: boolean) => {
        if (!policyID || !bankAccountID) {
            return;
        }

        Navigation.navigate(ROUTES.BANK_ACCOUNT_ENTER_SIGNER_INFO.getRoute(policyID, bankAccountID, isCompleted));
    };
    if (isReimbursementDirectionInformationRequiredAction(action)) {
        const {bankAccountLastFour, currency, policyID, bankAccountID, completed} =
            getOriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_DIRECTOR_INFORMATION_REQUIRED>(action) ?? {};

        return (
            <View style={[styles.chatItemMessage, style]}>
                <Text>{translate('signerInfoStep.isConnecting', bankAccountLastFour, currency)}</Text>
                <Button
                    style={[styles.mt2, styles.alignSelfStart]}
                    success
                    isDisabled={completed}
                    text={translate(completed ? 'signerInfoStep.thisStep' : 'signerInfoStep.enterSignerInfo')}
                    onPress={() => handleEnterSignerInfoPress(policyID, bankAccountID, !!completed)}
                    sentryLabel={CONST.SENTRY_LABEL.REPORT.REPORT_ACTION_ITEM_MESSAGE_ENTER_SIGNER_INFO}
                />
            </View>
        );
    }

    return (
        <ReportActionMessageContent
            action={action}
            displayAsGroup={displayAsGroup}
            reportID={reportID}
            style={style}
            isHidden={isHidden}
        />
    );
}

export default ReportActionItemMessage;
