import React, {useCallback, useMemo, useRef} from 'react';
import type {ValueOf} from 'type-fest';
import SelectionList from '@components/SelectionList';
import SplitListItem from '@components/SelectionList/ListItem/SplitListItem';
import type {ListItem, SplitListItemType} from '@components/SelectionList/ListItem/types';
import type {SelectionListHandle} from '@components/SelectionList/types';
import useThemeStyles from '@hooks/useThemeStyles';
import type CONST from '@src/CONST';

type SplitListProps = {
    /** The split expense sections data. */
    data: SplitListItemType[];

    /** The initially focused option key. */
    initiallyFocusedOptionKey: string | undefined;

    /** Callback when a row is selected. */
    onSelectRow: (item: SplitListItemType) => void;

    /** Footer content to render at the bottom of the list. */
    listFooterContent?: React.JSX.Element | null;

    /** The split mode to use (amount, percentage, or date). */
    mode: ValueOf<typeof CONST.TAB.SPLIT>;
};

type SplitListItemProps = React.ComponentProps<typeof SplitListItem>;

/**
 * Unified component for split expense tabs (Amount, Percentage, Date).
 * Renders split items with the appropriate input type based on mode,
 * managing its own scroll/height state.
 */
function SplitList({data, initiallyFocusedOptionKey, onSelectRow, listFooterContent, mode}: SplitListProps) {
    const styles = useThemeStyles();
    const listRef = useRef<SelectionListHandle<SplitListItemType>>(null);

    const handleInputFocus = useCallback((item: SplitListItemType) => {
        if (!listRef.current) {
            return;
        }
        listRef.current?.scrollToFocusedInput(item);
    }, []);

    // Create a wrapper component that adds the onInputFocus handler
    const SplitListItemWithInputFocus = useMemo(
        () =>
            ((props: SplitListItemProps) => (
                <SplitListItem
                    onInputFocus={(item: ListItem) => handleInputFocus(item as SplitListItemType)}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...props}
                />
            )) as typeof SplitListItem,
        [handleInputFocus],
    );

    const splitOptions = data.map((option) => ({...option, mode}));

    return (
        <SelectionList
            data={splitOptions}
            onSelectRow={onSelectRow}
            ref={listRef}
            initiallyFocusedItemKey={initiallyFocusedOptionKey}
            ListItem={SplitListItemWithInputFocus}
            style={{containerStyle: styles.flexBasisAuto}}
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
