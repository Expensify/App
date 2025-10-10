import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import type {SearchHeaderOptionValue} from '@components/Search/SearchPageHeader/SearchPageHeader';
import type {BankAccountMenuItem, SearchQueryJSON} from '@components/Search/types';
import type {SearchResults} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type {SearchResultsInfo} from '@src/types/onyx/SearchResults';

type SearchPageNarrowProps = {
    queryJSON?: SearchQueryJSON;
    metadata?: SearchResultsInfo;
    headerButtonsOptions: Array<DropdownOption<SearchHeaderOptionValue>>;
    searchResults?: SearchResults;
    isMobileSelectionModeEnabled: boolean;
    footerData: {
        count: number | undefined;
        total: number | undefined;
        currency: string | undefined;
    };
    currentSelectedPolicyID?: string | undefined;
    currentSelectedReportID?: string | undefined;
    confirmPayment?: (paymentType: PaymentMethodType | undefined) => void;
    latestBankItems?: BankAccountMenuItem[] | undefined;
};

export default SearchPageNarrowProps;
