import useInitialSelection from '@hooks/useInitialSelection';

import {useState} from 'react';

type RuleConditionSelection = {
    /** The values currently ticked */
    selectedValues: string[];

    /** The values ticked when the page opened, which the list keeps pinned to the top */
    initialSelectedValues: string[];

    /** Adds a value to the selection, or removes it when it is already selected */
    toggleValue: (value: string) => void;

    /** Adds every value passed to the selection, or removes them all when they are already selected */
    toggleAll: (visibleValues: string[]) => void;
};

/**
 * The selection a rule's condition pickers hold, which is the same for every field a rule can match on.
 *
 * `toggleAll` takes the values rather than reading them, because the pickers apply it to what the search has
 * left visible rather than to the whole list.
 */
function useRuleConditionSelection(draftValues: string[]): RuleConditionSelection {
    const [selectedValues, setSelectedValues] = useState<string[]>(draftValues);
    const initialSelectedValues = useInitialSelection(draftValues, {resetOnFocus: true});

    const toggleValue = (value: string) => {
        setSelectedValues((previous) => (previous.includes(value) ? previous.filter((selected) => selected !== value) : [...previous, value]));
    };

    const toggleAll = (visibleValues: string[]) => {
        const areAllSelected = visibleValues.length > 0 && visibleValues.every((value) => selectedValues.includes(value));

        if (areAllSelected) {
            const visibleSet = new Set(visibleValues);
            setSelectedValues((previous) => previous.filter((value) => !visibleSet.has(value)));
            return;
        }

        setSelectedValues((previous) => Array.from(new Set([...previous, ...visibleValues])));
    };

    return {selectedValues, initialSelectedValues, toggleValue, toggleAll};
}

export default useRuleConditionSelection;
