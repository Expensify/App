import useMergeInitialSyncingModal from '@hooks/useMergeInitialSyncingModal';

import type {MergeConnectionName} from '@libs/merge/MergeUtils';

import {useIsFocused} from '@react-navigation/core';

type MergeInitialSyncingModalListenerProps = {
    /** The workspace the connected Merge integration belongs to. */
    policyID: string;

    /** The Merge integration that is currently connected to the workspace. */
    connectionName: MergeConnectionName;
};

function MergeInitialSyncingModalListener({policyID, connectionName}: MergeInitialSyncingModalListenerProps) {
    const isFocused = useIsFocused();

    useMergeInitialSyncingModal(policyID, connectionName, isFocused);

    return null;
}

export default MergeInitialSyncingModalListener;
