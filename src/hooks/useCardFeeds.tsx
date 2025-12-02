import {useMemo} from 'react';
import type {OnyxCollection, ResultMetadata} from 'react-native-onyx';
import {getCompanyCardFeedWithDomainID} from '@libs/CardUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CardFeeds, CompanyCardFeed, CompanyCardFeedWithDomainID} from '@src/types/onyx';
import type {CustomCardFeedData, DirectCardFeedData} from '@src/types/onyx/CardFeeds';
import useOnyx from './useOnyx';
import useWorkspaceAccountID from './useWorkspaceAccountID';

type CombinedCardFeed = CustomCardFeedData &
    Partial<DirectCardFeedData> & {
        /** Custom feed name, originally coming from settings.companyCardNicknames */
        customFeedName?: string;

        /** Feed name */
        feed: CompanyCardFeed;
    };

type CombinedCardFeeds = Record<CompanyCardFeedWithDomainID, CombinedCardFeed>;

/**
 * This is a custom hook that combines workspace and domain card feeds for a given policy.
 *
 * This hook:
 * - Gets all available feeds (ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER) from Onyx.
 * - Extracts and compiles card feeds data including only feeds where the `preferredPolicy` matches the `policyID`.
 *
 * @param policyID - The workspace policyID to filter and construct card feeds for.
 * @returns -
 *   A tuple containing:
 *     1. Combined workspace and domain card feeds specific to the given policyID (or `undefined` if unavailable).
 *     2. The result metadata from the Onyx collection fetch.
 *     3. Card feeds specific to the given policyID (or `undefined` if unavailable).
 */
const useCardFeeds = (policyID: string | undefined): [CombinedCardFeeds | undefined, ResultMetadata<OnyxCollection<CardFeeds>>, CardFeeds | undefined] => {
    const workspaceAccountID = useWorkspaceAccountID(policyID);
    const [allFeeds, allFeedsResult] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER, {canBeMissing: true});
    const defaultFeed = allFeeds?.[`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID}`];

    const workspaceFeeds = useMemo(() => {
        if (!policyID || !allFeeds) {
            return undefined;
        }

        const result: CombinedCardFeeds = {};

        return Object.entries(allFeeds).reduce<CombinedCardFeeds>((acc, [onyxKey, feed]) => {
            if (!feed?.settings?.companyCards) {
                return acc;
            }

            // eslint-disable-next-line unicorn/no-array-for-each
            Object.entries(feed.settings.companyCards).forEach(([key, feedSettings]) => {
                const feedName = key as CompanyCardFeed;
                const feedOAuthAccountDetails = feed.settings.oAuthAccountDetails?.[feedName];
                const feedCompanyCardNickname = feed.settings.companyCardNicknames?.[feedName];
                const domainID = onyxKey.split('_').at(-1);
                const shouldAddFeed = domainID && (feedSettings.preferredPolicy ? feedSettings.preferredPolicy === policyID : domainID === workspaceAccountID.toString());

                if (!shouldAddFeed) {
                    return;
                }

                const combinedFeedKey = getCompanyCardFeedWithDomainID(feedName, domainID);

                acc[combinedFeedKey] = {
                    ...feedSettings,
                    ...feedOAuthAccountDetails,
                    customFeedName: feedCompanyCardNickname,
                    domainID: Number(domainID),
                    feed: feedName,
                };
            });

            return acc;
        }, result);
    }, [allFeeds, policyID, workspaceAccountID]);

    return [workspaceFeeds, allFeedsResult, defaultFeed];
};

export default useCardFeeds;
export type {CombinedCardFeeds, CompanyCardFeedWithDomainID, CombinedCardFeed};
