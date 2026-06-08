import React from 'react';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type NetSuiteCustomListPickerProps = {
    /** Current value of the selected item */
    value?: string;

    /** Policy ID from the parent route's URL params (preferred over policy?.id because it is set before the Onyx policy record hydrates) */
    policyID?: string;

    /** Form Error description */
    errorText?: string;

    /** Whether the parent step is in edit mode, so the selector returns to the correct step on back */
    isEditing?: boolean;
};

function NetSuiteCustomListPicker({value, policyID, errorText, isEditing}: NetSuiteCustomListPickerProps) {
    const {translate} = useLocalize();

    return (
        <MenuItemWithTopDescription
            shouldShowRightIcon
            title={value}
            description={translate('workspace.netsuite.import.importCustomFields.customLists.fields.listName')}
            onPress={() => {
                if (!policyID) {
                    return;
                }
                Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_LIST_SELECTOR.getRoute(policyID, isEditing ? 'edit' : undefined));
            }}
            brickRoadIndicator={errorText ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
            errorText={errorText}
        />
    );
}

export default NetSuiteCustomListPicker;
