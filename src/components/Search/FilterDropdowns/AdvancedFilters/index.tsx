import React from 'react';
import useFullscreenAdvancedFilters from '@components/Search/FilterDropdowns/AdvancedFilters/useFullscreenAdvancedFilters';
import type {SearchQueryJSON} from '@components/Search/types';
import type {PopoverComponentProps} from '../FilterPopupButton';
import AdvancedFiltersFullscreen from './AdvancedFiltersFullscreen';
import AdvancedFiltersPopup from './AdvancedFiltersPopup';

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
