import {act, renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useFeedKeysWithAssignedCards from '@hooks/useFeedKeysWithAssignedCards';
import useLocalize from '@hooks/useLocalize';
import useFilterFeedData from '@src/components/Search/hooks/useFilterFeedData';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@hooks/useLocalize');
jest.mock('@hooks/useFeedKeysWithAssignedCards');

const mockUseLocalize = useLocalize as jest.Mock;
const mockUseFeedKeysWithAssignedCards = useFeedKeysWithAssignedCards as jest.Mock;

describe('useFilterFeedData', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockUseLocalize.mockReturnValue({
            translate: (key: string) => key,
            localeCompare: (a: string, b: string) => a.localeCompare(b),
        });
        mockUseFeedKeysWithAssignedCards.mockReturnValue({});

        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('should return empty values when no data is available', async () => {
        const {result} = renderHook(() => useFilterFeedData());

        expect(result.current.feedOptions).toEqual([]);
        expect(result.current.feedValue).toEqual([]);
    });

    it('should return feed options when feeds are available in Onyx', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}123`, {
            settings: {
                companyCards: {
                    vcf: {},
                },
            },
        });

        const {result} = renderHook(() => useFilterFeedData());

        // Expected feed id is fundID_feed
        expect(result.current.feedOptions).toHaveLength(1);
        expect(result.current.feedOptions.at(0)?.value).toBe('123_vcf');
        expect(result.current.feedValue).toHaveLength(0);
    });

    it('should return selected feed value when filter form has values', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}123`, {
            settings: {
                companyCards: {
                    vcf: {},
                },
            },
        });
        await Onyx.merge(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {feed: ['123_vcf']});

        const {result} = renderHook(() => useFilterFeedData());

        expect(result.current.feedOptions).toHaveLength(1);
        expect(result.current.feedOptions.at(0)?.value).toBe('123_vcf');
        expect(result.current.feedValue).toHaveLength(1);
        expect(result.current.feedValue.at(0)?.value).toBe('123_vcf');
    });

    it('should update when Onyx data changes', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}123`, {
            settings: {
                companyCards: {
                    vcf: {},
                },
            },
        });

        const {result} = renderHook(() => useFilterFeedData());

        expect(result.current.feedOptions).toHaveLength(1);
        expect(result.current.feedOptions.at(0)?.value).toBe('123_vcf');

        // Add another feed
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}456`, {
                settings: {
                    companyCards: {
                        cdf: {},
                    },
                },
            });
        });

        expect(result.current.feedOptions).toHaveLength(2);
        const values = result.current.feedOptions.map((o) => o.value);
        expect(values.at(0)).toBe('456_cdf');
        expect(values.at(1)).toBe('123_vcf');
    });

    it('should include Expensify Card feeds from allCards', async () => {
        await Onyx.merge(ONYXKEYS.DERIVED.PERSONAL_AND_WORKSPACE_CARD_LIST, {
            card1: {
                bank: 'Expensify Card',
                fundID: '999',
            },
        });

        const {result} = renderHook(() => useFilterFeedData());

        expect(result.current.feedOptions).toHaveLength(1);
        expect(result.current.feedOptions.at(0)?.value).toBe('999_Expensify Card');
    });
});
