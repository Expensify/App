import {PopoverComponentProps} from '@components/Search/FilterDropdowns/DropdownButton';
import useFeedKeysWithAssignedCards from '@hooks/useFeedKeysWithAssignedCards';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {getFeedOptions} from '@libs/SearchUIUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import MultiSelectFilterPopup from './MultiSelectFilterPopup';

function FeedFilterPopup({closeOverlay}: PopoverComponentProps) {
    const {translate, localeCompare} = useLocalize();
    const feedKeysWithCards = useFeedKeysWithAssignedCards();

    const [allFeeds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER);
    const [personalAndWorkspaceCards] = useOnyx(ONYXKEYS.DERIVED.PERSONAL_AND_WORKSPACE_CARD_LIST);

    const feedOptions = getFeedOptions(allFeeds, personalAndWorkspaceCards, translate, localeCompare, feedKeysWithCards);

    return (
        <MultiSelectFilterPopup
            closeOverlay={closeOverlay}
            translationKey="search.filters.feed"
            items={feedOptions}
            value={feed}
            onChangeCallback={updateFeedFilterForm}
        />
    );
}

export default FeedFilterPopup;
