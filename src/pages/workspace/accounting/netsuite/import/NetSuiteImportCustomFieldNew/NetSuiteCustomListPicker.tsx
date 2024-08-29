import React, {useState} from 'react';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import type {CustomListSelectorType} from '@pages/workspace/accounting/netsuite/types';
import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';
import NetSuiteCustomListSelectorModal from './NetSuiteCustomListSelectorModal';

type NetSuiteCustomListPickerProps = {
    /** Current value of the selected item */
    value?: string;

    /** Current connected policy */
    policy?: Policy;

    /** Callback when the list item is selected */
    onInputChange?: (value: string, key?: string) => void;

    /** Id of the internalID input to be updated on input change */
    internalIDInputID?: string;

    /** Form Error description */
    errorText?: string;
};

function NetSuiteCustomListPicker({value, policy, internalIDInputID, errorText, onInputChange = () => {}}: NetSuiteCustomListPickerProps) {
    const {translate} = useLocalize();
    const [isPickerVisible, setIsPickerVisible] = useState(false);

    const hidePickerModal = () => {
        setIsPickerVisible(false);
    };

    const updateInput = (item: CustomListSelectorType) => {
        onInputChange?.(item.value);
        if (internalIDInputID) {
            onInputChange(item.id, internalIDInputID);
        }
        hidePickerModal();
    };

    return (
        <>
            <MenuItemWithTopDescription
                shouldShowRightIcon
                title={value}
                description={translate('workspace.netsuite.import.importCustomFields.customLists.fields.listName')}
                onPress={() => setIsPickerVisible(true)}
                brickRoadIndicator={errorText ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                errorText={errorText}
            />
            <NetSuiteCustomListSelectorModal
                isVisible={isPickerVisible}
                currentCustomListValue={value ?? ''}
                onCustomListSelected={updateInput}
                onClose={hidePickerModal}
                label={translate('workspace.netsuite.import.importCustomFields.customLists.fields.listName')}
                policy={policy}
                onBackdropPress={Navigation.dismissModal}
            />
        </>
    );
}

NetSuiteCustomListPicker.displayName = 'NetSuiteCustomListPicker';
export default NetSuiteCustomListPicker;
