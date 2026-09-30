import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import {useConfirmationFields} from '@components/MoneyRequestConfirmationFields/context';

import useLocalize from '@hooks/useLocalize';

import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import {callFunctionIfActionIsAllowed} from '@userActions/Session';

import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Unit} from '@src/types/onyx/Policy';
import type {TransactionCustomUnit} from '@src/types/onyx/Transaction';

import React from 'react';

import ExpenseFieldRow from './ExpenseFieldRow';
import {useExpenseFormLayout} from './ExpenseFormLayoutContext';

type DistanceFieldProps = {
    hasRoute: boolean;
    distance: number;
    unit: Unit | undefined;
    customUnit?: TransactionCustomUnit;
};

function DistanceField({hasRoute, distance, unit, customUnit}: DistanceFieldProps) {
    const {shouldUseDropdownRows} = useExpenseFormLayout();
    const {translate} = useLocalize();
    const {action, iouType, transactionID, reportID, reportActionID, isReadOnly, didConfirm, isManualDistanceRequest, isOdometerDistanceRequest, isGPSDistanceRequest} =
        useConfirmationFields();

    const displayUnit = unit ?? customUnit?.distanceUnit;
    const commuterExclusionData = DistanceRequestUtils.getCommuterExclusionDisplayData(customUnit, displayUnit ?? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES);
    const displayTitle = DistanceRequestUtils.getDistanceForDisplay(hasRoute, distance, unit, translate, false, isManualDistanceRequest, commuterExclusionData);
    const {distanceToDisplayDescription, distanceToDisplayHintText} = DistanceRequestUtils.getDistanceDisplayDetailsWithCommuter(commuterExclusionData, displayUnit, translate);

    // A GPS route is whatever the map traced, so there is nothing for the user to pick here.
    const isDistanceInteractive = !isReadOnly && !isGPSDistanceRequest;

    const openDistancePage = () => {
        if (!transactionID) {
            return;
        }

        if (isManualDistanceRequest) {
            Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_DISTANCE_MANUAL.getRoute(action, iouType, transactionID, reportID, reportActionID)));
            return;
        }

        if (isOdometerDistanceRequest) {
            Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_DISTANCE_ODOMETER.getRoute(action, iouType, transactionID, reportID));
            return;
        }

        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_DISTANCE.getRoute(action, iouType, transactionID, reportID, reportActionID)));
    };

    if (shouldUseDropdownRows) {
        return (
            <ExpenseFieldRow
                name={distanceToDisplayDescription}
                value={displayTitle}
                hintText={distanceToDisplayHintText}
                onPress={openDistancePage}
                isDisabled={didConfirm}
                isInteractive={isDistanceInteractive}
                sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.DISTANCE_FIELD}
            />
        );
    }

    return (
        <MenuItem.Root
            onPress={isInteractive ? callFunctionIfActionIsAllowed(openDistancePage) : undefined}
            isDisabled={didConfirm}
            sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.DISTANCE_FIELD}
        >
            <MenuItemField.Row
                name={distanceToDisplayDescription}
                value={displayTitle}
            >
                {isInteractive && <MenuItem.Chevron />}
            </MenuItemField.Row>
            {!!distanceToDisplayHintText && <MenuItem.HelpText message={distanceToDisplayHintText} />}
        </MenuItem.Root>
    );
}

export default DistanceField;
