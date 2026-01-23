import React from 'react';
import type {ForwardedRef} from 'react';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import {getHeaderMessageForNonUserList} from '@libs/OptionsListUtils';
import {getDestinationListSections} from '@libs/PerDiemRequestUtils';
import type {Destination} from '@libs/PerDiemRequestUtils';
import {getPerDiemCustomUnit} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import RadioListItem from './SelectionList/ListItem/RadioListItem';
import SelectionList from './SelectionList/SelectionListWithSections';
import type {ListItem, SelectionListWithSectionsHandle} from './SelectionList/types';

type DestinationPickerProps = {
    policyID: string;
    selectedDestination?: string;
    onSubmit: (item: ListItem & {currency: string}) => void;
    ref?: ForwardedRef<SelectionListWithSectionsHandle>;
};

function DestinationPicker({selectedDestination, policyID, onSubmit, ref}: DestinationPickerProps) {
    const policy = usePolicy(policyID);
    const customUnit = getPerDiemCustomUnit(policy);
    const [policyRecentlyUsedDestinations] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_DESTINATIONS}${policyID}`, {canBeMissing: true});

    const {translate} = useLocalize();
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');

    const getSelectedOptions = (): Destination[] => {
        if (!selectedDestination) {
            return [];
        }

        const selectedRate = customUnit?.rates?.[selectedDestination];

        if (!selectedRate?.customUnitRateID) {
            return [];
        }

        return [
            {
                rateID: selectedRate.customUnitRateID,
                name: selectedRate?.name ?? '',
                currency: selectedRate?.currency ?? CONST.CURRENCY.USD,
                isSelected: true,
            },
        ];
    };

    const sections = getDestinationListSections({
        searchValue: debouncedSearchValue,
        selectedOptions: getSelectedOptions(),
        destinations: Object.values(customUnit?.rates ?? {}),
        recentlyUsedDestinations: policyRecentlyUsedDestinations,
        translate,
    });

    const destinationsCount = Object.values(customUnit?.rates ?? {}).length;
    const shouldShowTextInput = destinationsCount >= CONST.STANDARD_LIST_ITEM_LIMIT;

    const destinationData = sections?.at(0)?.data ?? [];
    const selectedOptionKey = destinationData.find((destination) => destination.keyForList === selectedDestination)?.keyForList;

    const textInputOptions = {
        value: searchValue,
        label: translate('common.search'),
        onChangeText: setSearchValue,
        disableAutoFocus: true,
        headerMessage: getHeaderMessageForNonUserList(destinationData.length > 0, debouncedSearchValue),
    };

    return (
        <SelectionList
            ref={ref}
            key={selectedDestination}
            sections={sections}
            shouldShowTextInput={shouldShowTextInput}
            textInputOptions={textInputOptions}
            onSelectRow={onSubmit}
            ListItem={RadioListItem}
            initiallyFocusedItemKey={selectedOptionKey ?? undefined}
            shouldHideKeyboardOnScroll={false}
            shouldUpdateFocusedIndex
        />
    );
}

export default DestinationPicker;
