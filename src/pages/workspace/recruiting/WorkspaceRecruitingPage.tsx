import Text from '@components/Text';
import TextLink from '@components/TextLink';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
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

    const cards = getRecruitingCards({policy, policyEmployeePersonalDetails, policyID, icons, translate, formatPhoneNumber});

    return (
        <MergeConnectionsPageBase
            policyID={policyID}
            category={CONST.POLICY.CONNECTIONS.CATEGORY.RECRUITING}
            cards={cards}
            footer={
                <Text style={[styles.mutedTextLabel, styles.mt3]}>
                    {translate('workspace.recruiting.dontSeeYourATS.first')}
                    <TextLink
                        onPress={openSidePanel}
                        style={[styles.textLabel, styles.link]}
                    >
                        {' '}
                        {translate('workspace.recruiting.dontSeeYourATS.second')}{' '}
                    </TextLink>
                    {translate('workspace.recruiting.dontSeeYourATS.third')}
                </Text>
            }
        />
    );
}

export default WorkspaceRecruitingPage;
