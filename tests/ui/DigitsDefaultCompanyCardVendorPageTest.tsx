import {act, render} from '@testing-library/react-native';

import SelectionScreen from '@components/SelectionScreen';

import DigitsDefaultCompanyCardVendorPage from '@pages/workspace/accounting/digits/export/DigitsDefaultCompanyCardVendorPage';

import type {Policy} from '@src/types/onyx';
import type {DigitsVendor} from '@src/types/onyx/Policy';

import React from 'react';

import createMock from '../utils/createMock';

const mockUseState = React.useState;
let mockPolicy = createMock<Policy>({});

type DigitsDefaultCompanyCardVendorPageProps = React.ComponentProps<typeof DigitsDefaultCompanyCardVendorPage>;

jest.mock('@components/SelectionScreen', () => jest.fn(() => null));
jest.mock('@pages/workspace/withPolicyConnections', () => (WrappedComponent: React.ComponentType<{policy: Policy}>) => () => <WrappedComponent policy={mockPolicy} />);
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyIllustrations: jest.fn(() => ({Telescope: 'Telescope'})),
}));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
        localeCompare: (a: string, b: string) => a.localeCompare(b),
    })),
);
// Search filters on the debounced value, so skip the debounce to read the result in the same act()
jest.mock('@hooks/useDebouncedState', () =>
    jest.fn((initialValue: string) => {
        const [value, setValue] = mockUseState(initialValue);
        return [value, value, setValue];
    }),
);
jest.mock('@libs/actions/connections/Digits', () => ({
    clearDigitsErrorField: jest.fn(),
    updateDigitsDefaultVendor: jest.fn(),
}));
jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
}));

const VENDORS: DigitsVendor[] = [
    {id: '{"id":"48f4a1","issuer":"digits"}', name: 'Acme Supplies', roles: []},
    {id: '{"id":"9c02b7","issuer":"digits"}', name: 'Blue Bottle Coffee', roles: []},
    {id: '{"id":"d17e33","issuer":"digits"}', name: 'Digits Consulting', roles: []},
];

function renderPage(vendors: DigitsVendor[]) {
    mockPolicy = createMock<Policy>({id: '1', connections: {digits: {config: {export: {}}, data: {vendors}}}});
    render(<DigitsDefaultCompanyCardVendorPage {...createMock<DigitsDefaultCompanyCardVendorPageProps>({})} />);
}

function search(text: string) {
    act(() => {
        jest.mocked(SelectionScreen).mock.lastCall?.[0].textInputOptions?.onChangeText?.(text);
    });
    return jest.mocked(SelectionScreen).mock.lastCall?.[0];
}

describe('DigitsDefaultCompanyCardVendorPage', () => {
    beforeEach(() => {
        jest.mocked(SelectionScreen).mockClear();
    });

    it('matches vendors by name, not by the issuer and ID inside their Digits ID', () => {
        // Given Digits vendors whose IDs are JSON strings that all contain "issuer" and "digits"
        renderPage(VENDORS);

        // When the admin searches for "digits"
        const props = search('digits');

        // Then only the vendor named "Digits Consulting" is left, below the None row that clears the default vendor
        expect(props?.data?.map((item) => item.text)).toEqual(['common.none', 'Digits Consulting']);
    });

    it('says no results match when the search only matches the Digits IDs', () => {
        // Given Digits vendors whose IDs are JSON strings that all contain "issuer"
        renderPage(VENDORS);

        // When the admin searches for "issuer", which no vendor name contains
        const props = search('issuer');

        // Then no vendor is listed, so the page says nothing matched and only the None row remains
        expect(props?.data?.map((item) => item.text)).toEqual(['common.none']);
        expect(props?.textInputOptions?.headerMessage).toBe('common.noResultsFound');
    });
});
