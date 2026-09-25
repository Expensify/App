import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {usePersonalDetailsByLogins} from '@hooks/usePersonalDetailByLogin';
import usePolicy from '@hooks/usePolicy';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import MergeConnectionsPageBase from '@pages/workspace/merge/MergeConnectionsPageBase';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

import React from 'react';

import {getHRCards} from './utils';

type WorkspaceHRPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.HR>;

function WorkspaceHRPage({
    route: {
        params: {policyID},
    },
}: WorkspaceHRPageProps) {
    const {translate, getLocalDateFromDatetime, formatPhoneNumber} = useLocalize();
    const policy = usePolicy(policyID);
    const policyEmployeePersonalDetails = usePersonalDetailsByLogins([...Object.keys(policy?.employeeList ?? {})]);
    const [connectionSyncProgress] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`);
    const icons = useMemoizedLazyExpensifyIcons(['GustoSquare', 'TriNetSquare']);

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
