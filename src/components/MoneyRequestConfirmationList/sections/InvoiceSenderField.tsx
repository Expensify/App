import WorkspaceAvatar from '@components/Avatar/WorkspaceAvatar';
import MenuItem from '@components/MenuItem';
import MenuItemWithLabel from '@components/MenuItem/presets/MenuItemWithLabel';
import {useConfirmationFields} from '@components/MoneyRequestConfirmationFields/context';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {canSendInvoice} from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {emailSelector} from '@selectors/Session';
import React from 'react';

import {invoiceSenderSliceSelector} from './selectors';
import useTransactionSelector from './useTransactionSelector';

type InvoiceSenderFieldProps = {
    /** The selected participants */
    selectedParticipants: Participant[];
};

const senderWorkspaceSelector = (policy: OnyxEntry<OnyxTypes.Policy>) => (policy ? {id: policy.id, name: policy.name, avatarURL: policy.avatarURL} : undefined);

const createCanUpdateSenderWorkspaceSelector =
    (isInvoiceRoomParticipant: boolean, currentUserLogin: string | undefined, isFromGlobalCreate: boolean) =>
    (policies: OnyxCollection<OnyxTypes.Policy>): boolean =>
        isFromGlobalCreate && !isInvoiceRoomParticipant && canSendInvoice(policies ?? null, currentUserLogin);

function InvoiceSenderField({selectedParticipants}: InvoiceSenderFieldProps) {
    const {translate} = useLocalize();
    const {transactionID, isReadOnly, didConfirm} = useConfirmationFields();
    const transaction = useTransactionSelector(transactionID, invoiceSenderSliceSelector);

    const senderPolicyID = selectedParticipants.find((participant) => participant.isSender)?.policyID;

    const [senderWorkspace] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${senderPolicyID}`, {selector: senderWorkspaceSelector});
    const [currentUserLogin] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});

    const isFromGlobalCreate = !!transaction?.isFromGlobalCreate;

    const isInvoiceRoomParticipant = selectedParticipants.some((participant) => participant.isInvoiceRoom);

    // canSendInvoice needs the full policy collection to check all admin workspaces
    const [canUpdateSenderWorkspace] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        selector: createCanUpdateSenderWorkspaceSelector(isInvoiceRoomParticipant, currentUserLogin, isFromGlobalCreate),
    });

    const isInteractive = !isReadOnly && !!canUpdateSenderWorkspace;
    const onPress = isInteractive
        ? () => {
              if (!transaction?.transactionID) {
                  return;
              }
              Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_SEND_FROM.path));
          }
        : undefined;

    return (
        <MenuItemWithLabel
            label={translate('workspace.invoices.sendFrom')}
            onPress={onPress}
            isDisabled={didConfirm}
            sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.SEND_FROM_FIELD}
        >
            <MenuItem.Row>
                <MenuItem.Leading>
                    <WorkspaceAvatar
                        source={senderWorkspace?.avatarURL}
                        name={senderWorkspace?.name ?? ''}
                        avatarID={senderWorkspace?.id ?? CONST.DEFAULT_NUMBER_ID}
                    />
                </MenuItem.Leading>
                <MenuItem.Content>
                    {!!senderWorkspace?.name && <MenuItem.Title>{senderWorkspace.name}</MenuItem.Title>}
                    {senderWorkspace?.name ? (
                        <MenuItem.Description>{translate('workspace.common.workspace')}</MenuItem.Description>
                    ) : (
                        <MenuItem.DescriptionPlaceholder>{translate('workspace.common.workspace')}</MenuItem.DescriptionPlaceholder>
                    )}
                </MenuItem.Content>
                {isInteractive && (
                    <MenuItem.Trailing>
                        <MenuItem.Chevron />
                    </MenuItem.Trailing>
                )}
            </MenuItem.Row>
        </MenuItemWithLabel>
    );
}

export default InvoiceSenderField;
