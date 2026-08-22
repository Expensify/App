import AmountFilterContent from '@components/Search/FilterComponents/AdvancedFilters/AmountFilterContent';
import type {AmountFilterContentWrapperProps} from '@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent';

function AmountFilterContentPageWrapper({baseFilterKey, value, buttonText, onChange}: AmountFilterContentWrapperProps) {
    return (
        <AmountFilterContent
            baseFilterKey={baseFilterKey}
            value={value}
            largeButton
            autoFocus
            buttonText={buttonText}
            onChange={onChange}
        />
    );
}

export default AmountFilterContentPageWrapper;
