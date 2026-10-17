import useOnyx from '@hooks/useOnyx';

import {clearBulkAction, wasBulkActionInitiatedLocally} from '@libs/actions/BulkAction';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React, {useState} from 'react';

import BulkActionStatusModal from './BulkActionStatusModal';

/** Shows the status modal for a bulk action started from Search "Select all", and brings it back after a reload. */
function BulkActionStatusManager() {
    const [bulkActions, bulkActionsMetadata] = useOnyx(ONYXKEYS.COLLECTION.BULK_ACTION);
    const [openBulkActionID, setOpenBulkActionID] = useState<string | undefined>();

    // A record that already existed when this tab loaded resurfaces after a reload. One started in another tab
    // after that doesn't pop open here until this tab reloads.
    const [recordKeysAtLoad, setRecordKeysAtLoad] = useState<Set<string> | undefined>(undefined);
    if (recordKeysAtLoad === undefined && bulkActionsMetadata.status === 'loaded') {
        setRecordKeysAtLoad(new Set(Object.keys(bulkActions ?? {})));
    }

    const [surfaceableKey] =
        Object.entries(bulkActions ?? {}).find(([key, bulkAction]) => {
            // Concierge messages the result, so there is nothing to show here.
            if (!bulkAction || bulkAction.shouldSendFromConcierge) {
                return false;
            }
            return !!recordKeysAtLoad?.has(key) || wasBulkActionInitiatedLocally(key.replace(ONYXKEYS.COLLECTION.BULK_ACTION, ''));
        }) ?? [];
    const surfaceableBulkActionID = surfaceableKey?.replace(ONYXKEYS.COLLECTION.BULK_ACTION, '');

    // Keep the modal open through the switch to shouldSendFromConcierge, and close it once the record is gone.
    if (!openBulkActionID && surfaceableBulkActionID) {
        setOpenBulkActionID(surfaceableBulkActionID);
    }
    if (openBulkActionID && !bulkActions?.[`${ONYXKEYS.COLLECTION.BULK_ACTION}${openBulkActionID}`]) {
        setOpenBulkActionID(undefined);
    }

    if (!openBulkActionID) {
        return null;
    }

    const bulkAction = bulkActions?.[`${ONYXKEYS.COLLECTION.BULK_ACTION}${openBulkActionID}`];
    if (!bulkAction) {
        return null;
    }

    const handleClose = () => {
        if (bulkAction.shouldSendFromConcierge) {
            setOpenBulkActionID(undefined);
            return;
        }
        if (bulkAction.state === CONST.BULK_ACTION.STATE.RUNNING) {
            return;
        }
        clearBulkAction(openBulkActionID, bulkAction);
        setOpenBulkActionID(undefined);
    };

    return (
        <BulkActionStatusModal
            key={openBulkActionID}
            bulkActionID={openBulkActionID}
            isVisible
            onClose={handleClose}
        />
    );
}

export default BulkActionStatusManager;
