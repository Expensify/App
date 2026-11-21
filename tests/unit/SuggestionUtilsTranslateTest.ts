import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import {getDisplayNameForParticipant} from '@libs/ReportUtils';
import {getSortedPersonalDetails} from '@libs/SuggestionUtils';

import type {PersonalDetails} from '@src/types/onyx';

import {formatPhoneNumber, localeCompare, translateLocal} from '../utils/TestHelper';

jest.mock('@libs/ReportUtils', () => {
    // jest.requireActual is typed as returning `any`, so this assignment is unavoidably unsafe.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@libs/ReportUtils');
    // Spreading the actual (untyped `any`) module into the mock makes the return intentionally unsafe.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        __esModule: true,
        getDisplayNameForParticipant: jest.fn(({accountID}: {accountID: number}) => `Name ${accountID}`),
    };
});

const mockGetDisplayNameForParticipant = jest.mocked(getDisplayNameForParticipant);

describe('SuggestionUtils - getSortedPersonalDetails translate threading', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('passes the resolved hidden string to getDisplayNameForParticipant', () => {
        const first = {login: 'first@test.com', weight: 2, accountID: 801} as PersonalDetails & {weight: number};
        const second = {login: 'second@test.com', weight: 2, accountID: 802} as PersonalDetails & {weight: number};

        getSortedPersonalDetails([second, first], localeCompare, formatPhoneNumber, translateLocal, 20);

        // The sort comparator resolves each display name via getDisplayNameForParticipant, which must receive the resolved "Hidden" string.
        expect(mockGetDisplayNameForParticipant).toHaveBeenCalledWith(expect.objectContaining({hiddenTranslation: translateLocal('common.hidden')}));
    });

    it('sorts by the display name resolved through the provided translate function', () => {
        // Same weight forces the comparator to fall back to display names, which come from the provided translate.
        const alpha = {login: 'zzz@test.com', weight: 5, accountID: 811} as PersonalDetails & {weight: number};
        const beta = {login: 'aaa@test.com', weight: 5, accountID: 812} as PersonalDetails & {weight: number};
        // translate drives the resolved name: account 811 -> 'Aaa', account 812 -> 'Zzz'.
        const translateWithNames: LocalizedTranslate = translateLocal;
        mockGetDisplayNameForParticipant.mockImplementation(({accountID}) => (accountID === 811 ? 'Aaa' : 'Zzz'));

        const sorted = getSortedPersonalDetails([beta, alpha], localeCompare, formatPhoneNumber, translateWithNames, 20);

        // Despite beta being passed first, account 811 ('Aaa') sorts ahead of account 812 ('Zzz').
        expect(sorted.map((detail) => detail.accountID)).toEqual([811, 812]);
    });

    it('resolves each display name once, not on every comparison', () => {
        // Many users with the same weight, so every comparison needs the display names
        const users = Array.from({length: 50}, (_, index) => ({login: `user${index}@test.com`, weight: 2, accountID: 900 + ((index * 7) % 50)}) as PersonalDetails & {weight: number});
        mockGetDisplayNameForParticipant.mockImplementation(({accountID}) => `Name ${accountID}`);

        const sorted = getSortedPersonalDetails(users, localeCompare, formatPhoneNumber, translateLocal, 20);

        // The first 20 by name come back, and each user's name was looked up once
        expect(sorted.map((detail) => detail.accountID)).toEqual(Array.from({length: 20}, (_, index) => 900 + index));
        expect(mockGetDisplayNameForParticipant).toHaveBeenCalledTimes(users.length);
    });
});
