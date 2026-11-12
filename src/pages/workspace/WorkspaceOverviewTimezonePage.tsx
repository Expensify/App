import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import ScreenWrapper from '@components/ScreenWrapper';
import TimezoneSelectionList from '@components/TimezoneSelectionList';

import useLocalize from '@hooks/useLocalize';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {goBackFromInvalidPolicy} from '@libs/PolicyUtils';
import {getWorkspaceTimezone} from '@libs/SubmissionScheduleUtils';

import {setWorkspaceTimezone} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {SelectedTimezone} from '@src/types/onyx/PersonalDetails';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import React from 'react';

import type {WithPolicyOnyxProps} from './withPolicy';

import AccessOrNotFoundWrapper from './AccessOrNotFoundWrapper';
import withPolicy from './withPolicy';

type WorkspaceOverviewTimezonePageProps = WithPolicyOnyxProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TIMEZONE>;

function WorkspaceOverviewTimezonePage({policy, route}: WorkspaceOverviewTimezonePageProps) {
    const {translate} = useLocalize();
    const policyID = route.params.policyID;
    const savedTimezone = getWorkspaceTimezone(policy);

    const goBack = () => Navigation.goBack(ROUTES.WORKSPACE_OVERVIEW.getRoute(policyID));

    const save = (timezone: SelectedTimezone | undefined) => {
        if (timezone && timezone !== savedTimezone) {
            setWorkspaceTimezone(policyID, timezone, policy?.timeZone);
        }
        goBack();
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            fullPageNotFoundViewProps={{
                onLinkPress: goBackFromInvalidPolicy,
                subtitleKey: isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized',
            }}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                testID="WorkspaceOverviewTimezonePage"
            >
                <HeaderWithBackButtonAndTitle
                    title={translate('workspace.editor.timezoneInputLabel')}
                    onBackButtonPress={goBack}
                />
                <TimezoneSelectionList
                    savedTimezone={savedTimezone}
                    onSave={save}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicy(WorkspaceOverviewTimezonePage);
