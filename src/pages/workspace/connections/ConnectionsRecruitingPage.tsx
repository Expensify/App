import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import {usePersonalDetailsByLogins} from '@hooks/usePersonalDetailByLogin';
import usePolicy from '@hooks/usePolicy';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import {getRecruitingCards} from '@pages/workspace/recruiting/utils';

import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

import React from 'react';

import ConnectionsMergePageBase from './ConnectionsMergePageBase';

type ConnectionsRecruitingPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.CONNECTIONS_RECRUITING>;

function ConnectionsRecruitingPage({
    route: {
        params: {policyID},
    },
}: ConnectionsRecruitingPageProps) {
    const {translate, formatPhoneNumber} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Download']);
    const policy = usePolicy(policyID);
    const policyEmployeePersonalDetails = usePersonalDetailsByLogins([...Object.keys(policy?.employeeList ?? {})]);
    const {isBetaEnabled} = usePermissions();

    const cards = getRecruitingCards({policy, policyEmployeePersonalDetails, policyID, icons, translate, formatPhoneNumber});

    return (
        <ConnectionsMergePageBase
            policyID={policyID}
            category={CONST.POLICY.CONNECTIONS.CATEGORY.RECRUITING}
            cards={cards}
            shouldBeBlocked={!isBetaEnabled(CONST.BETAS.MERGE_ATS)}
        />
    );
}

export default ConnectionsRecruitingPage;
