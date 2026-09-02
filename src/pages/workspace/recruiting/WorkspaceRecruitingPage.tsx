import RenderHTML from '@components/RenderHTML';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import {usePersonalDetailsByLogins} from '@hooks/usePersonalDetailByLogin';
import usePolicy from '@hooks/usePolicy';
import useSidePanelActions from '@hooks/useSidePanelActions';
import useThemeStyles from '@hooks/useThemeStyles';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';

import MergeConnectionsPageBase from '@pages/workspace/merge/MergeConnectionsPageBase';

import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

import React from 'react';
import {View} from 'react-native';

import {getRecruitingCards} from './utils';

type WorkspaceRecruitingPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.RECRUITING>;

function WorkspaceRecruitingPage({
    route: {
        params: {policyID},
    },
}: WorkspaceRecruitingPageProps) {
    const {translate, formatPhoneNumber} = useLocalize();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['Download']);
    const policy = usePolicy(policyID);
    const policyEmployeePersonalDetails = usePersonalDetailsByLogins([...Object.keys(policy?.employeeList ?? {})]);
    const {openSidePanel} = useSidePanelActions();
    const {isBetaEnabled} = usePermissions();

    const cards = getRecruitingCards({policy, policyEmployeePersonalDetails, policyID, icons, translate, formatPhoneNumber});

    return (
        <MergeConnectionsPageBase
            policyID={policyID}
            category={CONST.POLICY.CONNECTIONS.CATEGORY.RECRUITING}
            cards={cards}
            shouldBeBlocked={!isBetaEnabled(CONST.BETAS.MERGE_ATS)}
            footer={
                <View style={[styles.mt3, styles.renderHTML]}>
                    <RenderHTML
                        html={translate('workspace.recruiting.dontSeeYourATS')}
                        onLinkPress={() => openSidePanel()}
                    />
                </View>
            }
        />
    );
}

export default WorkspaceRecruitingPage;
