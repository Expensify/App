import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import Navigation from '@libs/Navigation/Navigation';

import {callFunctionIfActionIsAllowed} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import {authTokenTypeSelector} from '@selectors/Session';
import React from 'react';

type NetSuiteCustomListPickerProps = {
    value?: string;

    /** Policy ID from the parent route's URL params (preferred over policy?.id because it is set before the Onyx policy record hydrates) */
    policyID?: string;

    /** Form Error description */
    errorText?: string;

    /** Whether the parent step is in edit mode, so the selector returns to the correct step on back */
    isEditing?: boolean;
};

function NetSuiteCustomListPicker({value, policyID, errorText, isEditing}: NetSuiteCustomListPickerProps) {
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
    const {translate} = useLocalize();

    return (
        <MenuItem.Root
            onPress={callFunctionIfActionIsAllowed(
                () => {
                    if (!policyID) {
                        return;
                    }
                    Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_LIST_SELECTOR.getRoute(policyID, isEditing ? 'edit' : undefined));
                },
                false,
                session,
            )}
        >
            <MenuItemField.Row
                name={translate('workspace.netsuite.import.importCustomFields.customLists.fields.listName')}
                value={value}
            >
                {!!errorText && <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />}
                <MenuItem.Chevron />
            </MenuItemField.Row>
            {!!errorText && (
                <MenuItem.HelpText
                    isError
                    message={errorText}
                />
            )}
        </MenuItem.Root>
    );
}

export default NetSuiteCustomListPicker;
