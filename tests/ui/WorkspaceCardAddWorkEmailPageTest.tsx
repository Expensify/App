import {fireEvent, render, screen} from '@testing-library/react-native';

import Navigation from '@libs/Navigation/Navigation';

import WorkspaceCompanyCardAddWorkEmailPage from '@pages/workspace/companyCards/WorkspaceCompanyCardAddWorkEmailPage';
import WorkspaceExpensifyCardAddWorkEmailPage from '@pages/workspace/expensifyCard/WorkspaceExpensifyCardAddWorkEmailPage';

import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import type * as NativeNavigation from '@react-navigation/native';

import React from 'react';

type ReactNativeComponents = {
    Pressable: React.ComponentType<{children?: React.ReactNode; onPress: () => void; testID: string}>;
    Text: React.ComponentType<{children?: React.ReactNode}>;
};

jest.mock('@components/Button', () => {
    const ReactMock = jest.requireActual<typeof React>('react');
    const {Pressable, Text} = jest.requireActual<ReactNativeComponents>('react-native');
    const Button = ({children, onPress}: {children: React.ReactNode; onPress: () => void}) =>
        ReactMock.createElement(
            Pressable,
            {
                testID: 'addWorkEmailButton',
                onPress,
            },
            children,
        );
    Button.Text = ({children}: {children: React.ReactNode}) => ReactMock.createElement(Text, null, children);
    return {__esModule: true, default: Button};
});

jest.mock(
    '@components/FixedFooter',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('@components/HeaderWithBackButton', () => () => null);
jest.mock(
    '@components/ScreenWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock(
    '@components/Text',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
const mockActiveRoute = jest.fn(() => '');
const mockPrimaryContactMethod = jest.fn(() => 'user@gmail.com');
const mockIsUserValidated = jest.fn(() => true);

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof NativeNavigation>('@react-navigation/native'),
    useFocusEffect: (effect: () => void) => jest.requireActual<typeof React>('react').useEffect(effect),
}));
jest.mock('@libs/Navigation/helpers/getActiveRoute', () => ({__esModule: true, default: () => mockActiveRoute()}));
jest.mock('@hooks/usePrimaryContactMethod', () => ({__esModule: true, default: () => mockPrimaryContactMethod()}));
jest.mock('@hooks/useOnyx', () => ({__esModule: true, default: () => [mockIsUserValidated()]}));
jest.mock('@hooks/useLocalize', () => ({__esModule: true, default: () => ({translate: (key: string) => key})}));
jest.mock('@hooks/useThemeStyles', () => ({
    __esModule: true,
    default: () => ({flex1: {}, textHeadlineLineHeightXXL: {}, ph5: {}, mt2: {}, mb4: {}, textSupporting: {}}),
}));
jest.mock('@libs/Navigation/Navigation', () => ({__esModule: true, default: {navigate: jest.fn(), goBack: jest.fn()}}));
jest.mock('@navigation/Navigation', () => ({__esModule: true, default: {navigate: jest.fn(), goBack: jest.fn()}}));
jest.mock(
    '@pages/workspace/AccessOrNotFoundWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);

const POLICY_ID = 'policy123';

describe('Workspace card add work email pages', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockPrimaryContactMethod.mockReturnValue('user@gmail.com');
        mockIsUserValidated.mockReturnValue(true);
    });

    function renderCompanyCardPage() {
        return render(
            <WorkspaceCompanyCardAddWorkEmailPage
                // @ts-expect-error - Test only needs route parameters read by this screen.
                route={{name: SCREENS.WORKSPACE.COMPANY_CARD_ADD_WORK_EMAIL, key: 'company-card-add-work-email', params: {policyID: POLICY_ID}}}
            />,
        );
    }

    function renderExpensifyCardPage() {
        return render(
            <WorkspaceExpensifyCardAddWorkEmailPage
                // @ts-expect-error - Test only needs route parameters read by this screen.
                route={{name: SCREENS.WORKSPACE.EXPENSIFY_CARD_ADD_WORK_EMAIL, key: 'expensify-card-add-work-email', params: {policyID: POLICY_ID}}}
            />,
        );
    }

    it('opens Contact Methods on top of the company card prompt', () => {
        // Given the company card prompt is the active route
        const promptRoute = ROUTES.WORKSPACE_COMPANY_CARD_ADD_WORK_EMAIL.getRoute(POLICY_ID, 'vcf#123');
        mockActiveRoute.mockReturnValue(promptRoute);
        renderCompanyCardPage();

        // When the user presses the add work email button
        fireEvent.press(screen.getByTestId('addWorkEmailButton'));

        // Then Contact Methods opens on top of the prompt, so going back pops to it
        expect(Navigation.navigate).toHaveBeenCalledWith(`${promptRoute}/contact-methods`);
    });

    it('opens Contact Methods on top of the Expensify Card prompt', () => {
        // Given the Expensify Card prompt is the active route
        const promptRoute = ROUTES.WORKSPACE_EXPENSIFY_CARD_ADD_WORK_EMAIL.getRoute(POLICY_ID, 123);
        mockActiveRoute.mockReturnValue(promptRoute);
        renderExpensifyCardPage();

        // When the user presses the add work email button
        fireEvent.press(screen.getByTestId('addWorkEmailButton'));

        // Then Contact Methods opens on top of the prompt, so going back pops to it
        expect(Navigation.navigate).toHaveBeenCalledWith(`${promptRoute}/contact-methods`);
    });

    it('stays on the company card prompt while the primary contact method is public', () => {
        renderCompanyCardPage();

        expect(Navigation.goBack).not.toHaveBeenCalled();
    });

    it('returns to the company card feed selector once a work email is the primary contact method', () => {
        // Given the user came back to the prompt after making a work email their primary contact method
        mockPrimaryContactMethod.mockReturnValue('user@company.com');

        // When the prompt is focused
        renderCompanyCardPage();

        // Then it goes back to the feed selector
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.WORKSPACE_COMPANY_CARDS_SELECT_FEED.getRoute(POLICY_ID));
    });

    it('stays on the Expensify Card prompt while the account is not validated', () => {
        mockPrimaryContactMethod.mockReturnValue('user@company.com');
        mockIsUserValidated.mockReturnValue(false);

        renderExpensifyCardPage();

        expect(Navigation.goBack).not.toHaveBeenCalled();
    });

    it('returns to the Expensify Card feed selector once a validated work email is the primary contact method', () => {
        // Given the user came back to the prompt after making a work email their primary contact method
        mockPrimaryContactMethod.mockReturnValue('user@company.com');

        // When the prompt is focused
        renderExpensifyCardPage();

        // Then it goes back to the feed selector
        expect(Navigation.goBack).toHaveBeenCalledWith(`${ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(POLICY_ID)}/select-feed`);
    });
});
