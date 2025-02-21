import React, {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PerDiemRequestUtils from '@libs/PerDiemRequestUtils';
import type {Destination} from '@libs/PerDiemRequestUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SelectionList from './SelectionList';
import RadioListItem from './SelectionList/RadioListItem';
import type {ListItem} from './SelectionList/types';

type DestinationPickerProps = {
    policyID: string;
    selectedDestination?: string;
    onSubmit: (item: ListItem & {currency: string}) => void;
};

function DestinationPicker({selectedDestination, policyID, onSubmit}: DestinationPickerProps) {
    const policy = usePolicy(policyID);
    const customUnit = PolicyUtils.getPerDiemCustomUnit(policy);
    const [policyRecentlyUsedDestinations] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_DESTINATIONS}${policyID}`);

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
        const destinationOptions = PerDiemRequestUtils.getDestinationListSections({
            searchValue: debouncedSearchValue,
            selectedOptions,
            destinations: Object.values(customUnit?.rates ?? {}),
            recentlyUsedDestinations: policyRecentlyUsedDestinations,
        });

        const destinationData = destinationOptions?.at(0)?.data ?? [];
        const header = OptionsListUtils.getHeaderMessageForNonUserList(destinationData.length > 0, debouncedSearchValue);
        const destinationsCount = Object.values(customUnit?.rates ?? {}).length;
        const isDestinationsCountBelowThreshold = destinationsCount < CONST.STANDARD_LIST_ITEM_LIMIT;
        const showInput = !isDestinationsCountBelowThreshold;

        return [destinationOptions, header, showInput];
    }, [debouncedSearchValue, selectedOptions, customUnit?.rates, policyRecentlyUsedDestinations]);

    const selectedOptionKey = useMemo(
        () => (sections?.at(0)?.data ?? []).filter((destination) => destination.keyForList === selectedDestination).at(0)?.keyForList,
        [sections, selectedDestination],
    );

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
            isRowMultilineSupported
        />
    );
}

DestinationPicker.displayName = 'DestinationPicker';

export default DestinationPicker;
