import type {OnyxEntry} from 'react-native-onyx';
import type {SearchAdvancedFiltersForm} from '@src/types/form';

const filterGroupCurrencySelector = (searchAdvancedFiltersForm: OnyxEntry<SearchAdvancedFiltersForm>) => searchAdvancedFiltersForm?.groupCurrency;
const filterPolicyIDSelector = (searchAdvancedFiltersForm: OnyxEntry<SearchAdvancedFiltersForm>) => searchAdvancedFiltersForm?.policyID;

export {filterGroupCurrencySelector, filterPolicyIDSelector};
