
import { MultiSelectItem, MultiSelectItem } from '@components/Search/FilterDropdowns/MultiSelectPopup';
import MultiSelectFilterPopup from './MultiSelectFilterPopup';

type FeedFilterPopupProps = {
            items:  Array<MultiSelectItem<string>>
            value:  Array<MultiSelectItem<string>>
   closeOverlay: () => void;
            onChangeCallback: (items: Array<MultiSelectItem<string>>) => void
}

function FeedFilterPopup({ closeOverlay,  items, value, onChangeCallback }: FeedFilterPopupProps) {


    return (
        <MultiSelectFilterPopup
            closeOverlay={closeOverlay} 
            translationKey="search.filters.feed"
            items={items}
            value={value}
            onChangeCallback={onChangeCallback}
        />
    );
}

export default FeedFilterPopup;
