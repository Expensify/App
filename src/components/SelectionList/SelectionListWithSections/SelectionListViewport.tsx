/** Exposes the virtualized list without mounting its legacy inline input. */
import type {ListItemComponent} from '@components/SelectionList/ListItem/types';
import type {SelectionListStyle} from '@components/SelectionList/types';

import type {ReactElement} from 'react';

import React from 'react';

import type {ListItem, Section} from './types';

import SelectionListBody from './SelectionListBody';
import {SelectionListViewportContext, useSelectionListInteractionRefs} from './SelectionListRoot';

type SelectionListViewportProps<TItem extends ListItem> = {
    sections: Array<Section<TItem>>;
    rowComponent: ListItemComponent<NoInfer<TItem>>;
    onSelectRow: (item: TItem) => void;
    /** The query that produced the displayed sections. */
    searchQuery?: string;
    initiallyFocusedItemKey?: string;
    loading?: ReactElement;
    empty?: ReactElement;
    style?: SelectionListStyle;
    addBottomSafeAreaPadding?: boolean;
    titleNumberOfLines?: number;
};

function SelectionListViewport<TItem extends ListItem>({
    sections,
    rowComponent,
    onSelectRow,
    searchQuery,
    initiallyFocusedItemKey,
    loading,
    empty,
    style,
    addBottomSafeAreaPadding,
    titleNumberOfLines,
}: SelectionListViewportProps<TItem>) {
    const interactionRefs = useSelectionListInteractionRefs();

    return (
        <SelectionListViewportContext.Provider value={interactionRefs}>
            <SelectionListBody
                sections={sections}
                ListItem={rowComponent}
                searchValueForFocusSync={searchQuery}
                onSelectRow={onSelectRow}
                initiallyFocusedItemKey={initiallyFocusedItemKey}
                listEmptyContent={loading ?? empty}
                style={style}
                addBottomSafeAreaPadding={addBottomSafeAreaPadding}
                titleNumberOfLines={titleNumberOfLines}
            />
        </SelectionListViewportContext.Provider>
    );
}

export default SelectionListViewport;
export type {SelectionListViewportProps};
