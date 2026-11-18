/**
 * Keep travel-billing account and vendor changes local until the user saves them.
 */
import type {SelectorType} from '@components/SelectionScreen';

import useLocalize from '@hooks/useLocalize';

import {useRef, useState} from 'react';

function useTravelBillingSelection(data: SelectorType[], onSelect: (row: SelectorType) => void) {
    const {translate} = useLocalize();
    const [draftValue, setDraftValue] = useState<string>();
    const didSubmit = useRef(false);
    const savedValue = data.find((option) => option.isSelected)?.value;
    const selectedValue = draftValue ?? savedValue;
    const selectedOption = data.find((option) => option.value === selectedValue);
    const hasChanges = !!selectedOption && !selectedOption.isDisabled && selectedOption.isInteractive !== false && selectedValue !== savedValue;

    const selectOption = ({value}: SelectorType) => {
        setDraftValue(value);
    };

    const saveSelection = () => {
        if (!hasChanges || !selectedOption || didSubmit.current) {
            return;
        }

        // Every consumer navigates back on save, so ignore duplicate submissions during that transition.
        didSubmit.current = true;
        onSelect(selectedOption);
    };

    return {
        data: data.map((option) => ({...option, isSelected: option.value === selectedValue})),
        selectOption,
        confirmButtonOptions: {
            showButton: data.length > 0,
            text: translate('common.save'),
            onConfirm: saveSelection,
            isDisabled: !hasChanges,
        },
    };
}

export default useTravelBillingSelection;
