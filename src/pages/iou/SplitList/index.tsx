import SelectionList from '@components/SelectionList';
import SplitListItem from '@components/SelectionList/ListItem/SplitListItem';
import type {SplitListItemType} from '@components/SelectionList/ListItem/types';
import type {SelectionListHandle} from '@components/SelectionList/types';

import useThemeStyles from '@hooks/useThemeStyles';

import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import React, {useRef} from 'react';

import useHandleInputFocus from './useHandleInputFocus';

type SplitListProps = {
    /** The split expense sections data. */
    data: SplitListItemType[];

    initiallyFocusedOptionKey: string | undefined;
    onSelectRow: (item: SplitListItemType) => void;

    /** Footer content to render at the bottom of the list. */
    listFooterContent?: React.JSX.Element | null;

    /** Header content to render at the top of the list. */
    listHeaderContent?: React.JSX.Element | null;

    /** The split mode to use (amount, percentage, or date). */
    mode: ValueOf<typeof CONST.TAB.SPLIT>;
};

/**
 * Unified component for split expense tabs (Amount, Percentage, Date).
 * Renders split items with the appropriate input type based on mode,
 * managing its own scroll/height state.
 */
function SplitList({data, initiallyFocusedOptionKey, onSelectRow, listFooterContent, listHeaderContent, mode}: SplitListProps) {
    const styles = useThemeStyles();
    const listRef = useRef<SelectionListHandle<SplitListItemType>>(null);

    const handleInputFocus = useHandleInputFocus({listRef});

    const splitOptions = data.map((option) => ({...option, mode, onInputFocus: handleInputFocus}));

    return (
        <SelectionList
            data={splitOptions}
            onSelectRow={onSelectRow}
            ref={listRef}
            initiallyFocusedItemKey={initiallyFocusedOptionKey}
            ListItem={SplitListItem}
            style={{containerStyle: styles.flexBasisAuto}}
            customListHeaderContent={listHeaderContent}
            listFooterContent={listFooterContent}
            shouldPreventDefaultFocusOnSelectRow
            shouldScrollToFocusedIndex={false}
            shouldSingleExecuteRowSelect
            disableKeyboardShortcuts
            canSelectMultiple={false}
        />
    );
}

export default SplitList;
