import useHRSyncResultsPage from '@hooks/useHRSyncResultsPage';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMergeHRInitialSyncingModal from '@hooks/useMergeHRInitialSyncingModal';
import useOnyx from '@hooks/useOnyx';
import {usePersonalDetailsByLogins} from '@hooks/usePersonalDetailByLogin';
import usePolicy from '@hooks/usePolicy';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';

import MergeConnectionsPageBase from '@pages/workspace/merge/MergeConnectionsPageBase';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

import {useIsFocused} from '@react-navigation/native';
import React from 'react';

import {getHRCards} from './utils';

type WorkspaceHRPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.HR>;

function WorkspaceHRPage({
    route: {
        params: {policyID},
    },
}: WorkspaceHRPageProps) {
    const {translate, getLocalDateFromDatetime, formatPhoneNumber} = useLocalize();
    const isFocused = useIsFocused();
    const policy = usePolicy(policyID);
    const policyEmployeePersonalDetails = usePersonalDetailsByLogins([...Object.keys(policy?.employeeList ?? {})]);
    const [connectionSyncProgress] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`);
    const icons = useMemoizedLazyExpensifyIcons(['GustoSquare', 'TriNetSquare']);

    useHRSyncResultsPage(connectionSyncProgress, isFocused);
    useMergeHRInitialSyncingModal(policyID, isFocused);

    const cards = getHRCards({
        policy,
        policyEmployeePersonalDetails,
        connectionSyncProgress,
        getLocalDateFromDatetime,
        translate,
        formatPhoneNumber,
        policyID,
        gustoIcon: icons.GustoSquare,
        trinetIcon: icons.TriNetSquare,
    });

    return (
        <MergeConnectionsPageBase
            policyID={policyID}
            category={CONST.POLICY.CONNECTIONS.CATEGORY.HR}
            cards={cards}
        />
    );
}

export default WorkspaceHRPage;
