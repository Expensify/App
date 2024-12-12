import React from 'react';
import ImportSpreadsheet from '@components/ImportSpreadsheet';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import * as PolicyUtils from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type ImportMembersPageProps = WithPolicyAndFullscreenLoadingProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.MEMBERS_IMPORT>;

function ImportMembersPage({policy}: ImportMembersPageProps) {
    const policyID = policy?.id ?? '';

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            fullPageNotFoundViewProps={{subtitleKey: isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized', onLinkPress: PolicyUtils.goBackFromInvalidPolicy}}
        >
            <ImportSpreadsheet
                backTo={ROUTES.WORKSPACE_MEMBERS.getRoute(policyID)}
                goTo={ROUTES.WORKSPACE_MEMBERS_IMPORTED.getRoute(policyID)}
            />
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyAndFullscreenLoading(ImportMembersPage);
