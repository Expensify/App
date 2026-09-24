import type {ListItem, SelectionListWithSectionsProps} from '@components/SelectionList/types';

type CurrencyListItem = ListItem & {
    currencyName: string;
    currencyCode: string;
};

type CurrencySelectionListProps = Partial<SelectionListWithSectionsProps<CurrencyListItem>> & {
    /** Label for the search text input */
    searchInputLabel: string;

    initiallySelectedCurrencyCode?: string;
    recentlyUsedCurrencies?: string[];
    onSelect: (item: CurrencyListItem) => void;

    /** The array of selected currencies. This prop should be used when multiple currencies can be selected */
    selectedCurrencies?: string[];

    canSelectMultiple?: boolean;

    /** List of excluded currency codes */
    excludedCurrencies?: string[];

    didScreenTransitionEnd?: boolean;
};

export type {CurrencyListItem, CurrencySelectionListProps};
