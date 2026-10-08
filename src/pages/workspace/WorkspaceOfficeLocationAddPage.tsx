import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import ScreenWrapper from '@components/ScreenWrapper';

import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {hasCompanyAddress} from '@libs/PolicyUtils';

import {addOfficeLocation} from '@userActions/Policy/DistanceRate';

import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import type {CompanyAddress} from '@src/types/onyx/Policy';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import React from 'react';

import AccessOrNotFoundWrapper from './AccessOrNotFoundWrapper';
import WorkspaceOfficeLocationForm from './WorkspaceOfficeLocationForm';

type WorkspaceOfficeLocationAddPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.OFFICE_LOCATION_ADD>;

function WorkspaceOfficeLocationAddPage({route}: WorkspaceOfficeLocationAddPageProps) {
    const {policyID} = route.params;
    const {translate} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const policy = usePolicy(policyID);
    const officeLocations = policy?.officeLocations;

    // Offices being deleted and additions that failed aren't on the server, so they don't count
    const savedOfficeLocations = Object.values(officeLocations ?? {}).filter(
        (officeLocation) =>
            officeLocation.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE &&
            !(officeLocation.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD && !isEmptyObject(officeLocation.errors)),
    );
    const officeCount = savedOfficeLocations.length;

    // The company address counts as an office, the primary one while no office is, so only a workspace without one makes
    // its first office primary
    const isCompanyAddressShown = hasCompanyAddress(policy);
    const isOnlyOffice = officeCount === 0 && !isCompanyAddressShown;

    // The company address row is listed with the offices, so its label is taken too
    const takenNames = [...savedOfficeLocations.map((officeLocation) => officeLocation.name), ...(isCompanyAddressShown ? [translate('common.companyAddress')] : [])];

    const addOffice = (name: string, address: CompanyAddress, isPrimary: boolean) => {
        // An office added without a name shows this one until the server names it the same way: numbered after the existing
        // offices, skipping names already in use regardless of case
        const lowerCaseTakenNames = new Set(takenNames.map((takenName) => takenName.toLowerCase()));
        let officeNumber = officeCount + 1;
        while (lowerCaseTakenNames.has(translate('workspace.officeLocations.defaultName', {officeNumber}).toLowerCase())) {
            officeNumber++;
        }
        addOfficeLocation(policyID, officeLocations, address, isPrimary, name, translate('workspace.officeLocations.defaultName', {officeNumber}));
        Navigation.goBack();
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            shouldBeBlocked={!isBetaEnabled(CONST.BETAS.COMMUTER_EXCLUSIONS_ARRANGEMENTS)}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                testID="WorkspaceOfficeLocationAddPage"
            >
                <HeaderWithBackButtonAndTitle title={translate('workspace.officeLocations.addOfficeLocation')} />
                <WorkspaceOfficeLocationForm
                    isPrimary={isOnlyOffice}
                    isPrimaryLocked={isOnlyOffice}
                    isNameRequired={false}
                    takenNames={takenNames}
                    onSubmit={addOffice}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceOfficeLocationAddPage;
