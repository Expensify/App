import React from 'react';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';

type NetSuiteCustomListPickerProps = {
    /** Current value of the selected item */
    value?: string;

    /** Current connected policy */
    policy?: Policy;

    /** Form Error description */
    errorText?: string;
};

function NetSuiteCustomListPicker({value, policy, errorText}: NetSuiteCustomListPickerProps) {
    const {translate} = useLocalize();
    const policyID = policy?.id;

    return (
        <MenuItemWithTopDescription
            shouldShowRightIcon
            title={value}
            description={translate('workspace.netsuite.import.importCustomFields.customLists.fields.listName')}
            onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_LIST_SELECTOR.getRoute(policyID))}
            brickRoadIndicator={errorText ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
            errorText={errorText}
        />
    );
}

export default NetSuiteCustomListPicker;
