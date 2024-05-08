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

    /** Callback to fire when a currency is selected */
    onSelect: (item: CurrencyListItem) => void;
};

export type {CurrencyListItem, CurrencySelectionListProps, CurrencySelectionListOnyxProps};
