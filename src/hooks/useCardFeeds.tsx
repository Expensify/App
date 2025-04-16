import type {OnyxCollection, ResultMetadata} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CardFeeds, CompanyCardFeed} from '@src/types/onyx';
import useOnyx from './useOnyx';
import useWorkspaceAccountID from './useWorkspaceAccountID';

const useCardFeeds = (policyID: string | undefined): [CardFeeds | undefined, ResultMetadata<OnyxCollection<CardFeeds>>] => {
    const workspaceAccountID = useWorkspaceAccountID(policyID);
    const [allFeeds, allFeedsResult] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER);
    const defaultFeed = allFeeds?.[`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID}`];
    const {companyCards = {}, companyCardNicknames = {}, oAuthAccountDetails = {}} = defaultFeed?.settings ?? {};

    if (!policyID || !allFeeds) {
        return [undefined, allFeedsResult];
    }

    const workspaceFeeds = Object.values(allFeeds).reduce<CardFeeds & {settings: Required<CardFeeds['settings']>}>(
        (acc, feed) => {
            if (!feed?.settings?.companyCards) {
                return acc;
            }

            Object.entries(feed.settings.companyCards).forEach(([key, feedSettings]) => {
                const feedName = key as CompanyCardFeed;
                const feedOAuthAccountDetails = feed.settings.oAuthAccountDetails?.[feedName];
                const feedCompanyCardNicknames = feed.settings.companyCardNicknames?.[feedName];

                if (feedSettings.preferredPolicy !== policyID || acc.settings.companyCards[feedName]) {
                    return;
                }

                acc.settings.companyCards[feedName] = feedSettings;

                if (feedOAuthAccountDetails) {
                    acc.settings.oAuthAccountDetails[feedName] = feedOAuthAccountDetails;
                }
                if (feedCompanyCardNicknames) {
                    acc.settings.companyCardNicknames[feedName] = feedCompanyCardNicknames;
                }
            });

            return acc;
        },
        {settings: {companyCards, companyCardNicknames, oAuthAccountDetails}},
    );

    return [workspaceFeeds, allFeedsResult];
};

export default useCardFeeds;
