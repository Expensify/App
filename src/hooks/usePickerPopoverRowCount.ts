/**
 * Keeps an above-anchor popover from moving its search box when options change during a search.
 */
import {useState} from 'react';

type PickerSection = {data: readonly unknown[]; title?: string};

function usePickerPopoverRowCount(sections: readonly PickerSection[], searchKey: number) {
    const [frozen, setFrozen] = useState<{searchKey: number; rowCount: number}>();
    const frozenRowCount = frozen?.searchKey === searchKey ? frozen.rowCount : undefined;
    const rowCount = frozenRowCount ?? sections.reduce((total, section) => total + section.data.length + (section.title ? 1 : 0), 0);

    const updateSearchActive = (isSearchActive: boolean) => {
        if (isSearchActive && frozenRowCount === undefined) {
            setFrozen({searchKey, rowCount});
        } else if (!isSearchActive && frozenRowCount !== undefined) {
            setFrozen(undefined);
        }
    };

    return {rowCount, updateSearchActive};
}

export default usePickerPopoverRowCount;
