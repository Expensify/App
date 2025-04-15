import type {ResultMetadata} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CardFeeds, CompanyCardFeed} from '@src/types/onyx';
import useOnyx from './useOnyx';

const useCardFeeds = (policyID: string | undefined): [CardFeeds | undefined, ResultMetadata] => {
    const [allFeeds, allFeedsResult] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER);

    if (!policyID || !allFeeds) {
        return [undefined, allFeedsResult];
    }

    const workspaceFeeds: {settings: Required<CardFeeds['settings']>} = {settings: {companyCards: {}, companyCardNicknames: {}, oAuthAccountDetails: {}}};

    Object.values(allFeeds).forEach((feed) => {
        if (!feed) {
            return;
        }
        const companyCards = feed.settings.companyCards;
        Object.entries(companyCards ?? {}).forEach(([key, feedSettings]) => {
            const feedName = key as CompanyCardFeed;
            if (feedSettings.preferredPolicy === policyID && !workspaceFeeds.settings.companyCards[feedName]) {
                workspaceFeeds.settings.companyCards[feedName] = feedSettings;
                if (feed.settings.oAuthAccountDetails?.[feedName]) {
                    workspaceFeeds.settings.oAuthAccountDetails[feedName] = feed.settings.oAuthAccountDetails[feedName];
                }
                if (feed.settings.companyCardNicknames?.[feedName]) {
                    workspaceFeeds.settings.companyCardNicknames[feedName] = feed.settings.companyCardNicknames[feedName];
                }
            }
        });
    });

    return [workspaceFeeds, allFeedsResult];
};

export default useCardFeeds;
