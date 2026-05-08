import React from 'react';
import type {PopoverComponentProps} from '@components/Search/FilterDropdowns/FilterPopupButton';
import type {SearchQueryJSON} from '@components/Search/types';
import AdvancedFiltersFullscreen from './AdvancedFiltersFullscreen';
import AdvancedFiltersPopup from './AdvancedFiltersPopup';
import useFullscreenAdvancedFilters from './useFullscreenAdvancedFilters';

type AdvancedFiltersProps = {
    queryJSON: SearchQueryJSON;
    closeOverlay: PopoverComponentProps['closeOverlay'];
};

function AdvancedFilters({queryJSON, closeOverlay}: AdvancedFiltersProps) {
    const fullscreen = useFullscreenAdvancedFilters();

    if (fullscreen) {
        return (
            <AdvancedFiltersFullscreen
                queryJSON={queryJSON}
                closeOverlay={closeOverlay}
            />
        );
    }
    return <AdvancedFiltersPopup queryJSON={queryJSON} />;
}

export default AdvancedFilters;
