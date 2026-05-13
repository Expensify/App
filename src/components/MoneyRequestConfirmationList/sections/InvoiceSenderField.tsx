import {emailSelector} from '@selectors/Session';
import React, {useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import MenuItem from '@components/MenuItem';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {IOUType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import {createCanUpdateSenderWorkspaceSelector, invoiceSenderWorkspaceSelector} from './selectors';

type InvoiceSenderFieldProps = {
    /** The selected participants */
    selectedParticipants: Participant[];

    /** Flag indicating if it is read-only */
    isReadOnly: boolean;

    /** Flag indicating if the confirmation is done */
    didConfirm: boolean;

    /** The type of the IOU */
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;

    /** The report ID */
    reportID: string;

    /** The transaction */
    transaction: OnyxEntry<OnyxTypes.Transaction>;
};

function InvoiceSenderField({selectedParticipants, isReadOnly, didConfirm, iouType, reportID, transaction}: InvoiceSenderFieldProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const senderPolicyID = selectedParticipants.find((participant) => participant.isSender)?.policyID;

    const [senderWorkspace] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${senderPolicyID}`, {selector: invoiceSenderWorkspaceSelector});
    const [currentUserLogin] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});

    const isFromGlobalCreate = !!transaction?.isFromGlobalCreate;
    const canUpdateSelector = useMemo(
        () => createCanUpdateSenderWorkspaceSelector(selectedParticipants, currentUserLogin, isFromGlobalCreate),
        [selectedParticipants, currentUserLogin, isFromGlobalCreate],
    );
    const [canUpdateSenderWorkspace] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: canUpdateSelector});

    return (
        <MenuItem
            avatarID={senderWorkspace?.id}
            shouldShowRightIcon={!isReadOnly && !!canUpdateSenderWorkspace}
            title={senderWorkspace?.name}
            icon={senderWorkspace?.avatarURL ? senderWorkspace.avatarURL : getDefaultWorkspaceAvatar(senderWorkspace?.name)}
            iconType={CONST.ICON_TYPE_WORKSPACE}
            description={translate('workspace.common.workspace')}
            label={translate('workspace.invoices.sendFrom')}
            isLabelHoverable={false}
            interactive={!isReadOnly && !!canUpdateSenderWorkspace}
            onPress={() => {
                if (!transaction?.transactionID) {
                    return;
                }
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_SEND_FROM.getRoute(iouType, transaction.transactionID, reportID, Navigation.getActiveRoute()));
            }}
            style={styles.moneyRequestMenuItem}
            labelStyle={styles.mt2}
            titleStyle={styles.flex1}
            disabled={didConfirm}
            sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.SEND_FROM_FIELD}
        />
    );
}

export default InvoiceSenderField;
