import React, {useMemo} from 'react';
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
import SelectionList from './SelectionListWithSections';
import RadioListItem from './SelectionListWithSections/RadioListItem';
import type {ListItem} from './SelectionListWithSections/types';

type DestinationPickerProps = {
    policyID: string;
    selectedDestination?: string;
    onSubmit: (item: ListItem & {currency: string}) => void;
};

function DestinationPicker({selectedDestination, policyID, onSubmit}: DestinationPickerProps) {
    const policy = usePolicy(policyID);
    const customUnit = getPerDiemCustomUnit(policy);
    const [policyRecentlyUsedDestinations] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_DESTINATIONS}${policyID}`, {canBeMissing: true});

    const {translate} = useLocalize();
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');

    const selectedOptions = useMemo((): Destination[] => {
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
    }, [customUnit?.rates, selectedDestination]);

    const [sections, headerMessage, shouldShowTextInput] = useMemo(() => {
        const destinationOptions = getDestinationListSections({
            searchValue: debouncedSearchValue,
            selectedOptions,
            destinations: Object.values(customUnit?.rates ?? {}),
            recentlyUsedDestinations: policyRecentlyUsedDestinations,
            translate,
        });

        const destinationData = destinationOptions?.at(0)?.data ?? [];
        const header = getHeaderMessageForNonUserList(destinationData.length > 0, debouncedSearchValue);
        const destinationsCount = Object.values(customUnit?.rates ?? {}).length;
        const isDestinationsCountBelowThreshold = destinationsCount < CONST.STANDARD_LIST_ITEM_LIMIT;
        const showInput = !isDestinationsCountBelowThreshold;

        return [destinationOptions, header, showInput];
    }, [debouncedSearchValue, selectedOptions, customUnit?.rates, policyRecentlyUsedDestinations, translate]);

    const selectedOptionKey = useMemo(() => (sections?.at(0)?.data ?? []).find((destination) => destination.keyForList === selectedDestination)?.keyForList, [sections, selectedDestination]);

    return (
        <SelectionList
            sections={sections}
            headerMessage={headerMessage}
            textInputValue={searchValue}
            textInputLabel={shouldShowTextInput ? translate('common.search') : undefined}
            onChangeText={setSearchValue}
            onSelectRow={onSubmit}
            ListItem={RadioListItem}
            initiallyFocusedOptionKey={selectedOptionKey ?? undefined}
            shouldHideKeyboardOnScroll={false}
        />
    );
}

DestinationPicker.displayName = 'DestinationPicker';

export default DestinationPicker;
