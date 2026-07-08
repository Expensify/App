import type {LocaleContextProps} from '@components/LocaleContextProvider';

import {openPolicyCompanyCardsFeed, openPolicyCompanyCardsPage} from '@libs/actions/CompanyCards';
import * as API from '@libs/API';
import {READ_COMMANDS} from '@libs/API/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

jest.mock('@libs/API', () => ({
    read: jest.fn(),
}));

const mockRead = jest.mocked(API.read);

const translate: LocaleContextProps['translate'] = (path, ..._parameters) => String(path);

describe('CompanyCards RAM-only loading state updates', () => {
    beforeEach(() => {
        mockRead.mockClear();
    });

    it('openPolicyCompanyCardsPage successData merges RAM-only hasOnceLoadedPage and clears SHARED_NVP isLoading', () => {
        const policyID = 'policy123';
        const domainOrWorkspaceAccountID = 11111111;

        openPolicyCompanyCardsPage(policyID, domainOrWorkspaceAccountID, [], translate);

        expect(mockRead).toHaveBeenCalledWith(
            READ_COMMANDS.OPEN_POLICY_COMPANY_CARDS_PAGE,
            {
                policyID,
                emailList: JSON.stringify([]),
            },
            expect.objectContaining({
                successData: expect.arrayContaining([
                    expect.objectContaining({
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainOrWorkspaceAccountID}`,
                        value: {
                            isLoading: false,
                        },
                    }),
                    expect.objectContaining({
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: `${ONYXKEYS.COLLECTION.RAM_ONLY_COMPANY_CARDS_LOADING_STATE}${domainOrWorkspaceAccountID}`,
                        value: {
                            hasOnceLoadedPage: true,
                        },
                    }),
                ]),
            }),
        );
    });

    it('openPolicyCompanyCardsFeed successData merges RAM-only feed hasOnceLoaded and clears feed isLoading', () => {
        const policyID = 'policy123';
        const domainAccountID = 11111111;
        const feed = CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE;

        openPolicyCompanyCardsFeed(domainAccountID, policyID, feed, translate);

        expect(mockRead).toHaveBeenCalledWith(
            READ_COMMANDS.OPEN_POLICY_COMPANY_CARDS_FEED,
            {
                domainAccountID,
                policyID,
                feed,
            },
            expect.objectContaining({
                successData: expect.arrayContaining([
                    expect.objectContaining({
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainAccountID}`,
                        value: {
                            settings: {
                                cardFeedsStatus: {
                                    [feed]: {
                                        isLoading: false,
                                    },
                                },
                            },
                        },
                    }),
                    expect.objectContaining({
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: `${ONYXKEYS.COLLECTION.RAM_ONLY_COMPANY_CARDS_LOADING_STATE}${domainAccountID}`,
                        value: {
                            feeds: {
                                [feed]: {
                                    hasOnceLoaded: true,
                                },
                            },
                        },
                    }),
                ]),
            }),
        );
    });

    it('openPolicyCompanyCardsPage skips loading state updates when domainOrWorkspaceAccountID is 0', () => {
        openPolicyCompanyCardsPage('policy123', CONST.DEFAULT_NUMBER_ID, [], translate);

        expect(mockRead).toHaveBeenCalledWith(
            READ_COMMANDS.OPEN_POLICY_COMPANY_CARDS_PAGE,
            expect.any(Object),
            expect.objectContaining({
                optimisticData: [],
                successData: [],
            }),
        );
    });
});
