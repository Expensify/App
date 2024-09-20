import type {OnyxEntry} from 'react-native-onyx';
import type {ListItem} from '@components/SelectionList/types';
import type {CurrencyList} from '@src/types/onyx';

type CurrencyListItem = ListItem & {
    currencyName: string;
    currencyCode: string;
};

type CurrencySelectionListOnyxProps = {
    /** List of available currencies */
    currencyList: OnyxEntry<CurrencyList>;
};

type CurrencySelectionListProps = CurrencySelectionListOnyxProps & {
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
};

export type {CurrencyListItem, CurrencySelectionListProps, CurrencySelectionListOnyxProps};
