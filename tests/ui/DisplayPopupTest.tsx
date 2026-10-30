import {render, screen} from '@testing-library/react-native';

import DisplayPopup from '@components/Search/FilterDropdowns/DisplayPopup';

import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';

jest.mock('@components/Search/hooks/useUpdateFilterQuery', () => () => ({updateFilterQueryParams: jest.fn()}));

jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyExpensifyIcons: () => ({Columns: {}})}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useOnyx', () => jest.fn(() => [undefined, {status: 'loaded'}]));
jest.mock('@hooks/useResponsiveLayout', () => () => ({isLargeScreenWidth: true, isSmallScreenWidth: false}));
jest.mock('@hooks/useThemeStyles', () => () => ({pv4: {}}));

jest.mock('@userActions/Session', () => ({callFunctionIfActionIsAllowed: (callback: () => void) => callback}));

describe('DisplayPopup', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shows the column settings option in Bills search', () => {
        // Given the user is viewing Bills on a wide screen
        const queryJSON = buildSearchQueryJSON('type:bill');
        if (!queryJSON) {
            throw new Error('Expected the Bills search query to parse');
        }

        // When the Display menu renders for Bills
        render(
            <DisplayPopup
                queryJSON={queryJSON}
                searchResults={undefined}
                closeOverlay={jest.fn()}
                onSort={jest.fn()}
            />,
        );

        // Then it exposes Edit columns because Bills uses the expense report column settings.
        expect(screen.getByLabelText('search.editColumns')).toBeOnTheScreen();
    });

    it('does not show column settings for invoice search', () => {
        // Given the user is viewing invoices on a wide screen
        const queryJSON = buildSearchQueryJSON(`type:${CONST.SEARCH.DATA_TYPES.INVOICE}`);
        if (!queryJSON) {
            throw new Error('Expected the invoice search query to parse');
        }

        // When the Display menu renders for invoices
        render(
            <DisplayPopup
                queryJSON={queryJSON}
                searchResults={undefined}
                closeOverlay={jest.fn()}
                onSort={jest.fn()}
            />,
        );

        // Then invoice search still hides the picker because it has no custom report columns.
        expect(screen.queryByLabelText('search.editColumns')).not.toBeOnTheScreen();
    });
});
