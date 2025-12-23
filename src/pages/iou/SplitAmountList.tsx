import React, {useCallback, useMemo, useRef} from 'react';
import SelectionList from '@components/SelectionList';
import SplitListItem from '@components/SelectionList/ListItem/SplitListItem';
import {SplitListItemProps, SplitListItemType} from '@components/SelectionList/ListItem/types';
import {ListItem, SelectionListHandle} from '@components/SelectionList/types';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type SplitAmountListProps = {
    /** The split expense sections data. */
    data: SplitListItemType[];
    /** The initially focused option key. */
    initiallyFocusedOptionKey: string | undefined;
    /** Callback when a row is selected. */
    onSelectRow: (item: SplitListItemType) => void;
    /** Footer content to render at the bottom of the list. */
    listFooterContent?: React.JSX.Element | null;
};

function SplitListItemWithInputFocusWrapper(props: SplitListItemProps<ListItem> & {onInputFocusHandler: (item: SplitListItemType) => void}) {
    const {onInputFocusHandler, ...restProps} = props;

    const onInputFocus = (item: ListItem) => {
        onInputFocusHandler(item as SplitListItemType);
    };
    return (
        <SplitListItem
            onInputFocus={onInputFocus}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restProps}
        />
    );
}

/**
 * Dedicated component for the Amount tab in Split Expense flow.
 * Renders split items with amount inputs, managing its own scroll/height state.
 */
function SplitAmountList({data, initiallyFocusedOptionKey, onSelectRow, listFooterContent}: SplitAmountListProps) {
    const styles = useThemeStyles();
    const listRef = useRef<SelectionListHandle<SplitListItemType>>(null);

    const amountSections = useMemo(() => {
        return data.map((item) => ({
            ...item,
            mode: CONST.TAB.SPLIT.AMOUNT,
        }));
    }, [data]);

    const handleInputFocus = useCallback((item: SplitListItemType) => {
        if (!listRef.current) {
            return;
        }
        listRef.current?.scrollToFocusedInput(item);
    }, []);

    const SplitListItemWithInputFocus = useCallback(
        (props: SplitListItemProps<ListItem>) => (
            <SplitListItemWithInputFocusWrapper
                onInputFocusHandler={handleInputFocus}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            />
        ),
        [handleInputFocus],
    ) as typeof SplitListItem;

    return (
        <SelectionList
            ref={listRef}
            data={amountSections}
            ListItem={SplitListItemWithInputFocus}
            onSelectRow={onSelectRow}
            initiallyFocusedItemKey={initiallyFocusedOptionKey}
            style={{containerStyle: [styles.flexBasisAuto]}}
            listFooterContent={listFooterContent}
            shouldPreventDefaultFocusOnSelectRow
            shouldSingleExecuteRowSelect
            disableKeyboardShortcuts
        />
    );
}

SplitAmountList.displayName = 'SplitAmountList';

export default SplitAmountList;
