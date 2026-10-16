import asyncOpenURL from '@libs/asyncOpenURL';
import openExternalLink from '@libs/openExternalLink';

jest.mock('@libs/asyncOpenURL');

const mockedAsyncOpenURL = jest.mocked(asyncOpenURL);

describe('openExternalLink', () => {
    test('delegates to asyncOpenURL with the link and its options', () => {
        openExternalLink('https://example.com', true, true);

        expect(mockedAsyncOpenURL).toHaveBeenCalledTimes(1);
        expect(mockedAsyncOpenURL).toHaveBeenLastCalledWith(expect.any(Promise), 'https://example.com', true, true);
    });

    test('defaults both options to false', () => {
        openExternalLink('https://example.com');

        expect(mockedAsyncOpenURL).toHaveBeenLastCalledWith(expect.any(Promise), 'https://example.com', false, false);
    });
});
