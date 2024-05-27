import React from 'react';
import Text from '@components/Text';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';
import type {OriginalMessageRenamed} from '@src/types/onyx/OriginalMessage';

type RenameActionProps = WithCurrentUserPersonalDetailsProps & {
    /** All the data of the action */
    action: ReportAction;
};

function RenameAction({currentUserPersonalDetails, action}: RenameActionProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const currentUserAccountID = currentUserPersonalDetails.accountID ?? '';
    const userDisplayName = action.person?.[0]?.text;
    const actorAccountID = action.actorAccountID ?? '';
    const displayName = actorAccountID === currentUserAccountID ? `${translate('common.you')}` : `${userDisplayName}`;
    const originalMessage =
        action.actionName === CONST.REPORT.ACTIONS.TYPE.RENAMED ? ReportActionsUtils.getReportActionOriginalMessage<OriginalMessageRenamed['originalMessage']>(action) : null;
    const oldName = originalMessage?.oldName ?? '';
    const newName = originalMessage?.newName ?? '';

    return (
        <Text style={[styles.pv3, styles.ph5, styles.textAlignCenter, styles.textLabelSupporting]}>
            <Text style={[styles.textLabelSupporting, styles.textStrong, styles.textAlignCenter]}>{displayName}</Text>
            {translate('newRoomPage.renamedRoomAction', {oldName, newName})}
        </Text>
    );
}

RenameAction.displayName = 'RenameAction';

export default withCurrentUserPersonalDetails(RenameAction);
