import {render, screen} from '@testing-library/react-native';

import CurrencyInlineListAdapter from '@components/DynamicForm/adapters/CurrencyInlineListAdapter';

import CONST from '@src/CONST';

import React from 'react';

jest.mock('@components/CurrencySelectionList', () => jest.fn(() => null));
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => new Proxy({}, {get: () => ({})})));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));

describe('CurrencyInlineListAdapter', () => {
    it('masks the currency list in session recordings', () => {
        // Given a currency list whose picked currency must stay out of session recordings
        const forwardedFSClass = CONST.FULLSTORY.CLASS.MASK;

        // When it renders
        render(<CurrencyInlineListAdapter forwardedFSClass={forwardedFSClass} />);

        // Then the view around the list carries the mask, since CurrencySelectionList takes no FullStory class itself
        expect(screen.toJSON()).toMatchObject({props: {fsClass: forwardedFSClass}});
    });
});
