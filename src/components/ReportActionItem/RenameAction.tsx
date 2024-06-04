import React from 'react';
import Text from '@components/Text';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import type {ReportAction} from '@src/types/onyx';

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
        ReportActionsUtils.isRenamedAction(action) ? ReportActionsUtils.getOriginalMessage(action) : null;
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
