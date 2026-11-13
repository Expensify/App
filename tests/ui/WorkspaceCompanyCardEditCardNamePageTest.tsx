import {render} from '@testing-library/react-native';

import useOnyx from '@hooks/useOnyx';

import WorkspaceCompanyCardEditCardNamePage from '@pages/workspace/companyCards/WorkspaceCompanyCardEditCardNamePage';

import {updateCompanyCardName} from '@userActions/CompanyCards';

import SCREENS from '@src/SCREENS';

import type * as ReactNavigation from '@react-navigation/native';

import React from 'react';

// ─── Captured state ──────────────────────────────────────────────────────────

let capturedOnSubmit: ((values: Record<string, string>) => void) | undefined;

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.mock('@hooks/useWorkspaceAccountID', () => jest.fn(() => 1));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);
jest.mock('@hooks/useAutoFocusInput', () => jest.fn(() => ({inputCallbackRef: jest.fn()})));
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => ({})));

jest.mock('@hooks/useCardFeeds', () => jest.fn(() => [undefined, {status: 'loaded'}]));
jest.mock('@hooks/useOnyx', () => jest.fn(() => [undefined, {status: 'loaded'}]));

jest.mock('@libs/CardUtils', () => ({
    getCardNameError: jest.fn(() => null),
    getCardNameErrorMessage: jest.fn(() => ''),
    getCompanyCardFeed: jest.fn((feed: string) => feed),
    getCompanyFeeds: jest.fn(() => ({})),
    getDomainOrWorkspaceAccountID: jest.fn(() => 42),
    splitCardFeedWithDomainID: jest.fn(() => ({feedName: 'vcf', domainID: 42})),
}));

jest.mock('@libs/StringUtils', () => ({
    __esModule: true,
    default: {sanitizeName: jest.fn((name: string) => name)},
}));

jest.mock('@navigation/Navigation', () => ({goBack: jest.fn()}));

jest.mock('@react-navigation/native', () => {
    const actualNavigation: typeof ReactNavigation = jest.requireActual('@react-navigation/native');
    return {...actualNavigation, useFocusEffect: jest.fn()};
});

jest.mock(
    '@pages/workspace/AccessOrNotFoundWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock(
    '@components/ScreenWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('@components/HeaderWithBackButton', () => () => null);
jest.mock('@components/Text', () => () => null);
jest.mock('@components/Form/InputWrapper', () => () => null);
jest.mock('@components/TextInput', () => () => null);

jest.mock('@components/Form/FormProvider', () => {
    function MockFormProvider({onSubmit, children}: {onSubmit: (values: Record<string, string>) => void; children?: React.ReactNode}) {
        capturedOnSubmit = onSubmit;
        return children ?? null;
    }
    return MockFormProvider;
});

jest.mock('@pages/workspace/companyCards/utils', () => ({
    getCompanyCardDetailsBackPath: jest.fn(() => ''),
}));

jest.mock('@userActions/CompanyCards', () => ({
    updateCompanyCardName: jest.fn(),
}));

const mockUpdateCompanyCardName = jest.mocked(updateCompanyCardName);
const mockUseOnyx = jest.mocked(useOnyx);

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CARD_ID = '99';

function pageElement() {
    return (
        <WorkspaceCompanyCardEditCardNamePage
            // @ts-expect-error - Minimal test stub; the page reads route.params and calls navigation.getState() in the submit handler
            route={{key: 'test', name: SCREENS.WORKSPACE.COMPANY_CARD_EDIT_CARD_NAME, params: {policyID: 'p1', cardID: CARD_ID, feed: 'visa'}}}
            // @ts-expect-error - Stub navigation that only implements getState
            navigation={{getState: () => ({})}}
        />
    );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('WorkspaceCompanyCardEditCardNamePage', () => {
    beforeEach(() => {
        capturedOnSubmit = undefined;
        mockUpdateCompanyCardName.mockClear();
        mockUseOnyx.mockReturnValue([undefined, {status: 'loaded'}]);
    });

    it('renders nothing (returns null) while card data is still loading', () => {
        // Given useOnyx reports that card data is still loading
        mockUseOnyx.mockReturnValue([undefined, {status: 'loading'}]);

        // When the page renders
        const {toJSON} = render(pageElement());

        // Then the page returns null — no form is shown until data is ready
        expect(toJSON()).toBeNull();
    });

    it('passes cardTitle as the oldCardTitle rollback argument when the card has an existing name', () => {
        // Given a card whose admin previously set cardTitle to "My Card" — the selector returns it as a scalar
        mockUseOnyx.mockReturnValue(['My Card', {status: 'loaded'}]);

        // When the page renders and the form is submitted with a new name
        render(pageElement());
        capturedOnSubmit?.({name: 'New name'});

        // Then updateCompanyCardName receives "My Card" as the rollback value so a failed rename reverts to it
        expect(mockUpdateCompanyCardName).toHaveBeenCalledWith(
            42, // domainOrWorkspaceAccountID from the getDomainOrWorkspaceAccountID mock
            CARD_ID,
            'New name',
            'visa', // getCompanyCardFeed mock returns the feed arg unchanged
            'My Card',
        );
    });

    it('passes undefined as the oldCardTitle rollback argument when the card has no prior name', () => {
        // Given a card that was never renamed — the selector returns undefined
        mockUseOnyx.mockReturnValue([undefined, {status: 'loaded'}]);

        // When the form is submitted
        render(pageElement());
        capturedOnSubmit?.({name: 'New name'});

        // Then updateCompanyCardName receives undefined so a failed rename nulls cardTitle
        expect(mockUpdateCompanyCardName).toHaveBeenCalledWith(42, CARD_ID, 'New name', 'visa', undefined);
    });
});
