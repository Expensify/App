import {useMemo} from 'react';
import type {OnyxCollection, ResultMetadata} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CardFeeds, CompanyCardFeed} from '@src/types/onyx';
import useOnyx from './useOnyx';
import useWorkspaceAccountID from './useWorkspaceAccountID';

/**
 * This is a custom hook that combines workspace and domain card feeds for a given policy.
 *
 * This hook:
 * - Gets all available feeds (ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER) from Onyx.
 * - Extracts and compiles card feeds data including only feeds where the `preferredPolicy` matches the `policyID`.
 * - Merges a workspace feed with relevant domain feeds.
 *
 * @param policyID - The workspace policyID to filter and construct card feeds for.
 * @returns -
 *   A tuple containing:
 *     1. Card feeds specific to the given policyID (or `undefined` if unavailable).
 *     2. The result metadata from the Onyx collection fetch.
 */
const useCardFeeds = (policyID: string | undefined): [CardFeeds | undefined, ResultMetadata<OnyxCollection<CardFeeds>>] => {
    const workspaceAccountID = useWorkspaceAccountID(policyID);
    const [allFeeds, allFeedsResult] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER, {canBeMissing: true});

    const workspaceFeeds = useMemo(() => {
        if (!policyID || !allFeeds) {
            return undefined;
        }

        const defaultFeed = allFeeds?.[`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID}`];
        const {companyCards = {}, companyCardNicknames = {}, oAuthAccountDetails = {}} = defaultFeed?.settings ?? {};

        const result: CardFeeds & {settings: Required<CardFeeds['settings']>} = {
            settings: {
                companyCards: {...companyCards},
                companyCardNicknames: {...companyCardNicknames},
                oAuthAccountDetails: {...oAuthAccountDetails},
            },
            isLoading: !defaultFeed || defaultFeed?.isLoading,
        };

        return Object.entries(allFeeds).reduce<CardFeeds & {settings: Required<CardFeeds['settings']>}>((acc, [onyxKey, feed]) => {
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

                const domainID = onyxKey.split('_').at(-1);

                acc.settings.companyCards[feedName] = {...feedSettings, domainID: domainID ? Number(domainID) : undefined};

                if (feedOAuthAccountDetails) {
                    acc.settings.oAuthAccountDetails[feedName] = feedOAuthAccountDetails;
                }
                if (feedCompanyCardNicknames) {
                    acc.settings.companyCardNicknames[feedName] = feedCompanyCardNicknames;
                }
            });

            return acc;
        }, result);
    }, [allFeeds, policyID, workspaceAccountID]);

    return [workspaceFeeds, allFeedsResult];
};

export default useCardFeeds;
