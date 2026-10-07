import Header from '@components/Header';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import ScreenWrapper from '@components/ScreenWrapper';

import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {hasCompanyAddress} from '@libs/PolicyUtils';

import {deleteOfficeLocation, updateOfficeLocation} from '@userActions/Policy/DistanceRate';

import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import type {CompanyAddress} from '@src/types/onyx/Policy';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import {deepEqual} from 'fast-equals';
import React from 'react';

import AccessOrNotFoundWrapper from './AccessOrNotFoundWrapper';
import WorkspaceOfficeLocationForm from './WorkspaceOfficeLocationForm';

type WorkspaceOfficeLocationEditPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.OFFICE_LOCATION_EDIT>;

function WorkspaceOfficeLocationEditPage({route}: WorkspaceOfficeLocationEditPageProps) {
    const {policyID, officeID} = route.params;
    const {translate} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const {showConfirmModal} = useConfirmModal();
    const icons = useMemoizedLazyExpensifyIcons(['Trashcan']);
    const policy = usePolicy(policyID);
    const officeLocations = policy?.officeLocations;
    const officeLocation = officeLocations?.[officeID];

    // The company address counts as an office, so only a workspace without one keeps at least one office and can't delete
    // its last office. Offices being deleted and additions that failed aren't on the server, so they don't count.
    const savedOfficeLocations = Object.entries(officeLocations ?? {}).filter(
        ([, otherOfficeLocation]) =>
            otherOfficeLocation.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE &&
            !(otherOfficeLocation.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD && !isEmptyObject(otherOfficeLocation.errors)),
    );
    const isCompanyAddressShown = hasCompanyAddress(policy);
    const canDelete = savedOfficeLocations.length > 1 || isCompanyAddressShown;

    // The company address row is listed with the offices, so its label is taken too
    const takenNames = [
        ...savedOfficeLocations.filter(([otherOfficeID]) => otherOfficeID !== officeID).map(([, otherOfficeLocation]) => otherOfficeLocation.name),
        ...(isCompanyAddressShown ? [translate('common.companyAddress')] : []),
    ];

    const saveOffice = (name: string, address: CompanyAddress, isPrimary: boolean) => {
        if (!officeLocation) {
            return;
        }
        const changes = {
            ...(name !== officeLocation.name ? {name} : {}),
            ...(!deepEqual(address, officeLocation.address) ? {address} : {}),
            ...(isPrimary && !officeLocation.isDefault ? {isDefault: true} : {}),
        };
        if (!isEmptyObject(changes)) {
            updateOfficeLocation(policyID, officeLocations, officeID, changes);
        }
        Navigation.goBack();
    };

    const confirmDelete = () => {
        showConfirmModal({
            title: translate('workspace.officeLocations.deleteOfficeLocation'),
            prompt: translate('workspace.officeLocations.deleteOfficeLocationConfirmation'),
            confirmText: translate('common.delete'),
            cancelText: translate('common.cancel'),
            buttonVariant: CONST.BUTTON_VARIANT.DANGER,
        }).then((result) => {
            if (result.action !== ModalActions.CONFIRM) {
                return;
            }
            deleteOfficeLocation(policyID, officeID);
            Navigation.goBack();
        });
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            shouldBeBlocked={!isBetaEnabled(CONST.BETAS.COMMUTER_EXCLUSIONS) || !officeLocation || officeLocation.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                testID="WorkspaceOfficeLocationEditPage"
            >
                <HeaderWithBackButtonAndTitle title={translate('workspace.officeLocations.editOfficeLocation')}>
                    {canDelete && (
                        <Header.IconButton
                            tooltipText={translate('common.delete')}
                            onPress={confirmDelete}
                            iconSrc={icons.Trashcan}
                            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.OVERVIEW.DELETE_OFFICE_LOCATION}
                        />
                    )}
                </HeaderWithBackButtonAndTitle>
                <WorkspaceOfficeLocationForm
                    officeLocation={officeLocation}
                    isPrimary={!!officeLocation?.isDefault}
                    isPrimaryLocked={!!officeLocation?.isDefault}
                    isNameRequired
                    takenNames={takenNames}
                    onSubmit={saveOffice}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceOfficeLocationEditPage;
