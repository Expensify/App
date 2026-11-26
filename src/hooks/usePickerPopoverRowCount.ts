/**
 * Keeps an above-anchor popover from moving its search box when options change during a search.
 */
import {useState} from 'react';

type PickerSection = {data: readonly unknown[]; title?: string};

function countListRows(sections: readonly PickerSection[] | undefined) {
    if (!sections) {
        return 0;
    }
    let rowCount = 0;
    for (const section of sections) {
        rowCount += section.data.length;
        if (section.title) {
            rowCount += 1;
        }
    }
    return rowCount;
}

function usePickerPopoverRowCount<TSections extends readonly PickerSection[]>(getUnfilteredSections: (() => TSections) | undefined, searchKey: number) {
    const [searchRowCountSnapshot, setSearchRowCountSnapshot] = useState<{searchKey: number; rowCount: number}>();
    const frozenRowCount = searchRowCountSnapshot?.searchKey === searchKey ? searchRowCountSnapshot.rowCount : undefined;
    const unfilteredSections = frozenRowCount === undefined ? getUnfilteredSections?.() : undefined;
    const rowCount = frozenRowCount ?? countListRows(unfilteredSections);

    const setRowCountFrozen = (shouldFreezeRowCount: boolean) => {
        if (shouldFreezeRowCount && frozenRowCount === undefined) {
            setSearchRowCountSnapshot({searchKey, rowCount});
        } else if (!shouldFreezeRowCount && frozenRowCount !== undefined) {
            setSearchRowCountSnapshot(undefined);
        }
    };

    return {rowCount, setRowCountFrozen, unfilteredSections};
}

export default usePickerPopoverRowCount;
