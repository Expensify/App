import {importPlaidAccounts, openPlaidCompanyCardLogin} from '@libs/actions/Plaid';
import * as API from '@libs/API';
import type {ApiRequestCommandParameters} from '@libs/API/types';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import getPlaidLinkTokenParameters from '@libs/getPlaidLinkTokenParameters';

jest.mock('@libs/API', () => ({
    read: jest.fn(),
    write: jest.fn(),
}));
jest.mock('@expensify/react-native-hybrid-app', () => ({
    __esModule: true,
    default: {
        isHybridApp: jest.fn(),
    },
}));

const readSpy = jest.spyOn(API, 'read');
const writeSpy = jest.spyOn(API, 'write');

describe('actions/Plaid', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('sends an absent company card feed as undefined', () => {
        openPlaidCompanyCardLogin('US');

        expect(readSpy).toHaveBeenCalledTimes(1);
        const call = readSpy.mock.calls.at(0);
        if (!call) {
            throw new Error('API.read was not called');
        }
        const [command, parameters] = call;
        const {redirectURI, androidPackage} = getPlaidLinkTokenParameters();
        const expectedParameters = {
            redirectURI,
            androidPackage,
            country: 'US',
            domain: undefined,
            isPersonal: undefined,
            feed: undefined,
            cardID: undefined,
        } satisfies ApiRequestCommandParameters[typeof READ_COMMANDS.OPEN_PLAID_CARDS_BANK_LOGIN];

        expect(command).toBe(READ_COMMANDS.OPEN_PLAID_CARDS_BANK_LOGIN);
        expect(parameters).toEqual(expectedParameters);
    });

    it('sends the base company card feed for a qualified feed', () => {
        openPlaidCompanyCardLogin('US', undefined, 'cdf#123');

        expect(readSpy).toHaveBeenCalledTimes(1);
        const call = readSpy.mock.calls.at(0);
        if (!call) {
            throw new Error('API.read was not called');
        }
        const [command, parameters] = call;
        const {redirectURI, androidPackage} = getPlaidLinkTokenParameters();
        const expectedParameters = {
            redirectURI,
            androidPackage,
            country: 'US',
            domain: undefined,
            isPersonal: undefined,
            feed: 'cdf',
            cardID: undefined,
        } satisfies ApiRequestCommandParameters[typeof READ_COMMANDS.OPEN_PLAID_CARDS_BANK_LOGIN];

        expect(command).toBe(READ_COMMANDS.OPEN_PLAID_CARDS_BANK_LOGIN);
        expect(parameters).toEqual(expectedParameters);
    });

    it.each([
        {feed: '', expectedFeed: ''},
        {feed: 'plaid.ins_1', expectedFeed: 'plaid.ins_1'},
        {feed: 'plaid.ins_1#123', expectedFeed: 'plaid.ins_1'},
        {feed: '#123', expectedFeed: ''},
        {feed: 'plaid.ins_1#123#456', expectedFeed: 'plaid.ins_1'},
        {feed: 'plaid.ins_1##', expectedFeed: 'plaid.ins_1'},
    ])('sends the base feed for "$feed"', ({feed, expectedFeed}) => {
        importPlaidAccounts('public-token', feed, 'Plaid bank', 'US', 'example.com', '[]', 'access-token');

        expect(writeSpy).toHaveBeenCalledTimes(1);
        const call = writeSpy.mock.calls.at(0);
        if (!call) {
            throw new Error('API.write was not called');
        }
        const [command, parameters] = call;
        const expectedParameters = {
            publicToken: 'public-token',
            feed: expectedFeed,
            feedName: 'Plaid bank',
            country: 'US',
            domainName: 'example.com',
            plaidAccounts: '[]',
            plaidAccessToken: 'access-token',
        } satisfies ApiRequestCommandParameters[typeof WRITE_COMMANDS.IMPORT_PLAID_ACCOUNTS];

        expect(command).toBe(WRITE_COMMANDS.IMPORT_PLAID_ACCOUNTS);
        expect(parameters).toEqual(expectedParameters);
    });
});
