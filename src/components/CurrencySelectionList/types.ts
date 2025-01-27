import type {ListItem} from '@components/SelectionList/types';

type CurrencyListItem = ListItem & {
    currencyName: string;
    currencyCode: string;
};

type CurrencySelectionListProps = {
    /** Label for the search text input */
    searchInputLabel: string;

    /** Currency item to be selected initially */
    initiallySelectedCurrencyCode?: string;

    /** List of recently used currencies */
    recentlyUsedCurrencies?: string[];

    /** Callback to fire when a currency is selected */
    onSelect: (item: CurrencyListItem) => void;

    /** The array of selected currencies. This prop should be used when multiple currencies can be selected */
    selectedCurrencies?: string[];

    /** Whether this is a multi-select list */
    canSelectMultiple?: boolean;

    /** List of excluded currency codes */
    excludedCurrencies?: string[];
};

export type {CurrencyListItem, CurrencySelectionListProps};
