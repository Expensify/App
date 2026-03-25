import {PopoverComponentProps} from '../FilterDropdowns/DropdownButton';
import MultiSelectFilterPopup from './MultiSelectFilterPopup';

function FeedFilterPopup({}: PopoverComponentProps) {
    return (
        <MultiSelectFilterPopup
            closeOverlay={props.closeOverlay}
            translationKey="search.filters.feed"
            items={feedOptions}
            value={feed}
            onChangeCallback={updateFeedFilterForm}
        />
    );
}

export default FeedFilterPopup;
