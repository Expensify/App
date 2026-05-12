import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import usePersonalDetailsByLogin from '@hooks/usePersonalDetailsByLogin';
import useThemeStyles from '@hooks/useThemeStyles';
import {getManagerOnVacation, getOriginalMessage, getSubmittedTo, getVacationer} from '@libs/ReportActionsUtils';
import type * as OnyxTypes from '@src/types/onyx';

type VacationDelegateTextProps = {
    /** The action whose vacation context drives the labels. */
    action: OnyxEntry<OnyxTypes.ReportAction>;
};

function VacationDelegateText({action}: VacationDelegateTextProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const personalDetailsByLogin = usePersonalDetailsByLogin();

    const vacationer = getVacationer(action);
    const submittedTo = getSubmittedTo(action);
    const managerOnVacation = getManagerOnVacation(action);
    const originalMessage = getOriginalMessage(action);
    const isAutomaticAction = originalMessage && 'automaticAction' in originalMessage ? originalMessage.automaticAction : false;

    const vacationDelegateDetailsForSubmit = personalDetailsByLogin[vacationer?.toLowerCase() ?? ''];
    const submittedToDetails = personalDetailsByLogin[submittedTo?.toLowerCase() ?? ''];
    const vacationDelegateDetailsForApprove = personalDetailsByLogin[managerOnVacation?.toLowerCase() ?? ''];

    return (
        <>
            {!!vacationer && !!submittedTo && (
                <Text style={[styles.chatDelegateMessage]}>
                    {translate('statusPage.toAsVacationDelegate', submittedToDetails?.displayName ?? submittedTo ?? '', vacationDelegateDetailsForSubmit?.displayName ?? vacationer ?? '')}
                </Text>
            )}
            {!!managerOnVacation && !isAutomaticAction && (
                <Text style={[styles.chatDelegateMessage]}>{translate('statusPage.asVacationDelegate', vacationDelegateDetailsForApprove?.displayName ?? managerOnVacation ?? '')}</Text>
            )}
        </>
    );
}

export default VacationDelegateText;
