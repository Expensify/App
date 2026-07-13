// The cards_ object keys don't follow normal naming convention, so to test this reliably we have to disable liner
/* eslint-disable @typescript-eslint/naming-convention */
import {buildCardsData} from '@libs/CardFeedUtils';
import type {CompanyCardFeedIcons} from '@libs/CardUtils';

import type IllustrationsType from '@styles/theme/illustrations/types';

import type {Card, CardList, WorkspaceCardsList} from '@src/types/onyx';

import createMock from '../../utils/createMock';

jest.mock('@src/components/ConfirmedRoute.tsx');

const illustrationComponentMock: IllustrationsType['EmptyStateBackgroundImage'] = () => null;

const workspaceCardFeedWithMetadata: WorkspaceCardsList = {
    '21593492': createMock<Card>({
        accountID: 1,
        bank: 'vcf',
        fundID: '18680694',
        cardID: 21593492,
        cardName: '480801XXXXXX9411',
        domainName: 'expensify-policy1.exfy',
        lastFourPAN: '9411',
    }),
    '21604933': createMock<Card>({
        accountID: 1,
        bank: 'vcf',
        fundID: '18680694',
        cardID: 21604933,
        cardName: '480801XXXXXX1601',
        domainName: 'expensify-policy1.exfy',
        lastFourPAN: '1601',
    }),
    '21638320': createMock<Card>({
        accountID: 1,
        bank: 'vcf',
        fundID: '18680694',
        cardID: 21638320,
        cardName: '480801XXXXXX2617',
        domainName: 'expensify-policy1.exfy',
        lastFourPAN: '2617',
    }),
    '21638598': createMock<Card>({
        accountID: 1,
        bank: 'vcf',
        fundID: '18680694',
        cardID: 21638598,
        cardName: '480801XXXXXX2111',
        domainName: 'expensify-policy1.exfy',
        lastFourPAN: '2111',
    }),
};
workspaceCardFeedWithMetadata.cardList = {
    test: '231:1111111',
};

const workspaceCardFeeds: Record<string, WorkspaceCardsList | undefined> = {
    cards_18680694_vcf: workspaceCardFeedWithMetadata,
    'cards_18755165_Expensify Card': {
        '21588678': createMock<Card>({
            accountID: 1,
            bank: 'Expensify Card',
            fundID: '18755165',
            cardID: 21588678,
            cardName: '455594XXXXXX1138',
            domainName: 'expensify-policy2.exfy',
            lastFourPAN: '1138',
        }),
        '21588684': createMock<Card>({
            accountID: 1,
            bank: 'Expensify Card',
            fundID: '18755165',
            cardID: 21588684,
            cardName: '',
            domainName: 'expensify-policy2.exfy',
            lastFourPAN: '',
        }),
    },
    'cards_11111_Expensify Card': {
        '21589168': createMock<Card>({
            accountID: 1,
            bank: 'Expensify Card',
            fundID: '18755166',
            cardID: 21589168,
            cardName: '455594XXXXXX4163',
            domainName: 'expensify-policy3.exfy',
            lastFourPAN: '4163',
        }),
        '21589182': createMock<Card>({
            accountID: 1,
            bank: 'Expensify Card',
            fundID: '18755166',
            cardID: 21589182,
            cardName: '',
            domainName: 'expensify-policy3.exfy',
            lastFourPAN: '',
        }),
        '21589202': createMock<Card>({
            accountID: 1,
            bank: 'Expensify Card',
            fundID: '18755166',
            cardID: 21589202,
            cardName: '455594XXXXXX6232',
            domainName: 'expensify-policy3.exfy',
            lastFourPAN: '6232',
        }),
        '21638322': createMock<Card>({
            accountID: 1,
            bank: 'Expensify Card',
            fundID: '18755166',
            cardID: 21638322,
            cardName: '',
            domainName: 'expensify-policy3.exfy',
            lastFourPAN: '',
        }),
    },
    'cards_11111212_Expensify Card': {
        '21589168': createMock<Card>({
            accountID: 1,
            bank: 'Expensify Card',
            fundID: '18755167',
            cardID: 21589168,
            cardName: '455594XXXXXX4163',
            domainName: 'mockDomain.com',
            lastFourPAN: '4163',
        }),
        '21589182': createMock<Card>({
            accountID: 1,
            bank: 'Expensify Card',
            cardID: 21589182,
            cardName: '',
            domainName: 'mockDomain.com',
            lastFourPAN: '',
        }),
    },
};

const cardList: CardList = {
    '21588678': createMock<Card>({
        accountID: 1,
        bank: 'Expensify Card',
        cardID: 21588678,
        cardName: '455594XXXXXX1138',
        domainName: 'expensify-policy2.exfy',
        lastFourPAN: '1138',
    }),
    '21588684': createMock<Card>({
        accountID: 1,
        bank: 'Expensify Card',
        cardID: 21588684,
        cardName: '',
        domainName: 'expensify-policy2.exfy',
        lastFourPAN: '',
    }),
    '21589202': createMock<Card>({
        accountID: 1,
        bank: 'Expensify Card',
        cardID: 21589202,
        cardName: '455594XXXXXX6232',
        domainName: 'expensify-policy3.exfy',
        lastFourPAN: '6232',
    }),
    '21604933': createMock<Card>({
        accountID: 1,
        bank: 'vcf',
        cardID: 21604933,
        cardName: '480801XXXXXX1601',
        domainName: 'expensify-policy1.exfy',
        lastFourPAN: '1601',
    }),
    '11111111': createMock<Card>({
        accountID: 1,
        bank: 'Expensify Card',
        cardID: 11111111,
        cardName: '455594XXXXXX1138',
        domainName: 'testDomain',
        lastFourPAN: '1138',
    }),
};

const workspaceCardFeedsHiddenOnSearch: Record<string, WorkspaceCardsList | undefined> = {
    'cards_11111_Expensify Card': {
        '21534278': createMock<Card>({
            accountID: 1,
            bank: 'Expensify Card',
            cardID: 21534278,
            domainName: 'expensify-policy1.exfy',
            nameValuePairs: {
                cardTitle: 'Not Issued card',
                isVirtual: false,
            },
            lastFourPAN: '',
            state: 2, // STATE_NOT_ISSUED
        }),
        '21539025': createMock<Card>({
            accountID: 1,
            bank: 'Expensify Card',
            cardID: 21539025,
            domainName: 'expensify-policy1.exfy',
            nameValuePairs: {
                cardTitle: 'Not activated card',
                isVirtual: false,
            },
            lastFourPAN: '',
            state: 4, // NOT_ACTIVATED
        }),
    },
};

const cardListHiddenOnSearch: CardList = {
    '21534538': createMock<Card>({
        accountID: 1,
        bank: 'Expensify Card',
        cardID: 21534538,
        domainName: 'expensify-policy1.exfy',
        nameValuePairs: {
            cardTitle: 'Not Issued card',
            isVirtual: false,
        },
        lastFourPAN: '',
        state: 2, // STATE_NOT_ISSUED
    }),
    '21534525': createMock<Card>({
        accountID: 1,
        bank: 'Expensify Card',
        cardID: 21534525,
        domainName: 'expensify-policy1.exfy',
        nameValuePairs: {
            cardTitle: 'Not activated card',
            isVirtual: false,
        },
        lastFourPAN: '',
        state: 4, // NOT_ACTIVATED
    }),
};

const workspaceCardFeedsClosed: Record<string, WorkspaceCardsList | undefined> = {
    'cards_11111_Expensify Card': {
        '21534278': createMock<Card>({
            accountID: 1,
            bank: 'Expensify Card',
            cardID: 21534278,
            domainName: 'expensify-policy1.exfy',
            nameValuePairs: {
                cardTitle: 'Not Issued card',
                isVirtual: false,
            },
            lastFourPAN: '1234',
            state: 6, // CLOSED
        }),
        '21539012': createMock<Card>({
            accountID: 1,
            bank: 'Expensify Card',
            cardID: 21539012,
            domainName: 'expensify-policy1.exfy',
            nameValuePairs: {
                cardTitle: 'Not activated card',
                isVirtual: false,
            },
            lastFourPAN: '3211',
            state: 6, // CLOSED
        }),
        '21539027': createMock<Card>({
            accountID: 1,
            bank: 'Expensify Card',
            cardID: 21539027,
            domainName: 'expensify-policy1.exfy',
            nameValuePairs: {
                cardTitle: 'Not activated card',
                isVirtual: false,
            },
            lastFourPAN: '',
            state: 3, // OPEN
        }),
    },
};

const cardListClosed: CardList = {
    '21534538': createMock<Card>({
        accountID: 1,
        bank: 'Expensify Card',
        cardID: 21534538,
        domainName: 'expensify-policy1.exfy',
        nameValuePairs: {
            cardTitle: 'Not Issued card',
            isVirtual: false,
        },
        lastFourPAN: '',
        state: 6, // CLOSED
    }),
    '21534525': createMock<Card>({
        accountID: 1,
        bank: 'Expensify Card',
        cardID: 21534525,
        domainName: 'expensify-policy1.exfy',
        nameValuePairs: {
            cardTitle: 'Not activated card',
            isVirtual: false,
        },
        lastFourPAN: '',
        state: 6, // CLOSED
    }),
    '21534526': createMock<Card>({
        accountID: 1,
        bank: 'Expensify Card',
        cardID: 21534526,
        domainName: 'expensify-policy1.exfy',
        nameValuePairs: {
            cardTitle: 'Not activated card',
            isVirtual: false,
        },
        lastFourPAN: '',
        state: 3, // OPEN
    }),
};

const illustrationsMock: IllustrationsType = {
    EmptyStateBackgroundImage: illustrationComponentMock,
    ExampleCheckES: 1,
    ExampleCheckEN: 2,
    FileImportTable: 3,
    WorkspaceProfile: 4,
    ExpensifyApprovedLogo: illustrationComponentMock,
    GenericCompanyCard: 5,
    GenericCompanyCardLarge: 6,
    GenericCSVCompanyCardLarge: 7,
    ExpensifyApprovedBadge: illustrationComponentMock,
};
const companyCardIconsMock: CompanyCardFeedIcons = {
    VisaCompanyCardDetailLarge: 1,
    AmexCardCompanyCardDetailLarge: 2,
    MasterCardCompanyCardDetailLarge: 3,
    BankOfAmericaCompanyCardDetailLarge: 4,
    CapitalOneCompanyCardDetailLarge: 5,
    ChaseCompanyCardDetailLarge: 6,
    CitibankCompanyCardDetailLarge: 7,
    WellsFargoCompanyCardDetailLarge: 8,
    BrexCompanyCardDetailLarge: 9,
    StripeCompanyCardDetailLarge: 10,
    PlaidCompanyCardDetailLarge: 11,
    ExpensifyCardImage: 12,
};

describe('buildIndividualCardsData', () => {
    it("Builds all individual cards and doesn't generate duplicates", () => {
        const result = buildCardsData(workspaceCardFeeds, cardList, {}, ['21588678'], illustrationsMock, companyCardIconsMock);

        expect(result.length).toEqual(13);

        // Check if Expensify card was built correctly
        const expensifyCard = result.find((card) => card.keyForList === '21588678');
        expect(expensifyCard).toMatchObject({
            lastFourPAN: '1138',
            isSelected: true,
        });

        // Check if company card was built correctly
        const companyCard = result.find((card) => card.keyForList === '21604933');
        expect(companyCard).toMatchObject({
            lastFourPAN: '1601',
            isSelected: false,
        });
    });
    it("Doesn't include physical cards that haven't been issued or haven't been activated", () => {
        const result = buildCardsData(workspaceCardFeedsHiddenOnSearch, cardListHiddenOnSearch, {}, [], illustrationsMock, companyCardIconsMock);
        expect(result.length).toEqual(0);
    });
});

describe('buildCardsData closed cards', () => {
    it("Builds all closed cards and doesn't generate duplicates", () => {
        const result = buildCardsData(workspaceCardFeedsClosed, cardListClosed, {}, ['21539012'], illustrationsMock, companyCardIconsMock, true);
        expect(result.length).toEqual(4);

        // Check if Expensify card was built correctly
        const expensifyCard = result.find((card) => card.keyForList === '21539012');
        expect(expensifyCard).toMatchObject({
            lastFourPAN: '3211',
            isSelected: true,
        });

        // Check if company card was built correctly
        const companyCard = result.find((card) => card.keyForList === '21534525');
        expect(companyCard).toMatchObject({
            lastFourPAN: '',
            isSelected: false,
        });
    });
});

describe('buildCardsData with empty argument objects', () => {
    it('Returns empty array when cardList and workspaceCardFeeds are empty', () => {
        const result = buildCardsData({}, {}, {}, [], illustrationsMock, companyCardIconsMock);
        expect(result).toEqual([]);
    });
});

describe('buildCardsData isPersonal with customCardNames', () => {
    it('Uses customCardNames for personal cards when provided', () => {
        // Card 11111111 has no fundID, so it is treated as personal (isPersonalCard returns true)
        const customCardNames: Record<string, string> = {
            '11111111': 'My Custom Card Label',
        };
        const result = buildCardsData(workspaceCardFeeds, cardList, {}, [], illustrationsMock, companyCardIconsMock, false, customCardNames);

        const personalCard = result.find((card) => card.keyForList === '11111111');
        expect(personalCard).toBeDefined();
        expect(personalCard?.cardName).toBe('My Custom Card Label');
    });

    it('Falls back to cardName for personal cards when customCardNames is not provided', () => {
        const result = buildCardsData(workspaceCardFeeds, cardList, {}, [], illustrationsMock, companyCardIconsMock);

        const personalCard = result.find((card) => card.keyForList === '11111111');
        expect(personalCard).toBeDefined();
        expect(personalCard?.cardName).toBe('455594XXXXXX1138');
    });
});
