import {filterFeedSelector} from '@selectors/Search';
import useFeedKeysWithAssignedCards from '@hooks/useFeedKeysWithAssignedCards';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {getFeedOptions} from '@libs/SearchUIUtils';
import ONYXKEYS from '@src/ONYXKEYS';

function useFilterFeedData() {
    const {translate, localeCompare} = useLocalize();
    const [allFeeds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER);
    const [personalAndWorkspaceCards] = useOnyx(ONYXKEYS.DERIVED.PERSONAL_AND_WORKSPACE_CARD_LIST);
    const [feed] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {selector: filterFeedSelector});

    const feedKeysWithCards = useFeedKeysWithAssignedCards();

    const feedOptions = getFeedOptions(allFeeds, personalAndWorkspaceCards, translate, localeCompare, feedKeysWithCards);
    const feedValue = feed ? feedOptions.filter((option) => feed.includes(option.value)) : [];
    return {feedOptions, feedValue};
}

export default useFilterFeedData;
