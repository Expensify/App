import AmountFilterContent from '@components/Search/FilterComponents/AdvancedFilters/AmountFilterContent';
import type {AmountFilterContentWrapperProps} from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';

type AmountFilterContentPageWrapperProps = AmountFilterContentWrapperProps;

function AmountFilterContentPageWrapper({filterKey, value, onChange, buttonText}: AmountFilterContentPageWrapperProps) {
    return (
        <AmountFilterContent
            filterKey={filterKey}
            value={value}
            largeButton
            autoFocus
            buttonText={buttonText}
            onChange={onChange}
        />
    );
}

export default AmountFilterContentPageWrapper;
