import {render, screen} from '@testing-library/react-native';

import SearchSidebar from '@components/Navigation/SearchSidebar';

import React from 'react';

let mockShouldUseFlatNavigationBar = false;
let mockShouldUseNarrowLayout = false;

jest.mock('@components/Navigation/FlatNavigationBar/useShouldUseFlatNavigationBar', () => () => mockShouldUseFlatNavigationBar);
jest.mock('@hooks/useResponsiveLayout', () => () => ({shouldUseNarrowLayout: mockShouldUseNarrowLayout}));
jest.mock('@hooks/useNetwork', () => () => ({isOffline: false}));
jest.mock('@pages/Search/SearchTypeMenuWide', () => {
    // The factory is hoisted above the imports, so it loads what it renders itself.
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
    const {Text: MockText} = require('react-native');
    return () => <MockText>Spend menu</MockText>;
});
jest.mock(
    '@components/Navigation/TopBar',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);

describe('SearchSidebar', () => {
    beforeEach(() => {
        mockShouldUseFlatNavigationBar = false;
        mockShouldUseNarrowLayout = false;
    });

    it('draws the Spend menu for users outside the flat nav beta', () => {
        // Given a wide layout without the flat navigation bar
        // When the Search navigator draws its extra content
        render(<SearchSidebar />);

        // Then the Spend column is there as before, so users outside the beta see no change
        expect(screen.getByText('Spend menu')).toBeOnTheScreen();
    });

    it('draws nothing when the flat navigation bar lists the Spend searches itself', () => {
        // Given a wide layout with the flat navigation bar
        mockShouldUseFlatNavigationBar = true;

        // When the Search navigator draws its extra content
        render(<SearchSidebar />);

        // Then there is no second column, so the Search page can take the whole width beside the bar
        expect(screen.queryByText('Spend menu')).toBeNull();
    });

    it('draws nothing on a narrow layout', () => {
        // Given a narrow layout, which has its own Spend menu inside the page
        mockShouldUseNarrowLayout = true;

        // When the Search navigator draws its extra content
        render(<SearchSidebar />);

        // Then the sidebar stays out of the way
        expect(screen.queryByText('Spend menu')).toBeNull();
    });
});
