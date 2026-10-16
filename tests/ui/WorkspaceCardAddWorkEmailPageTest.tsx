import {fireEvent, render, screen} from '@testing-library/react-native';

import Navigation from '@libs/Navigation/Navigation';

import WorkspaceCompanyCardAddWorkEmailPage from '@pages/workspace/companyCards/WorkspaceCompanyCardAddWorkEmailPage';
import WorkspaceExpensifyCardAddWorkEmailPage from '@pages/workspace/expensifyCard/WorkspaceExpensifyCardAddWorkEmailPage';

import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

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
jest.mock('@hooks/useLocalize', () => ({__esModule: true, default: () => ({translate: (key: string) => key})}));
jest.mock('@hooks/useThemeStyles', () => ({
    __esModule: true,
    default: () => ({flex1: {}, textHeadlineLineHeightXXL: {}, ph5: {}, mt2: {}, mb4: {}, textSupporting: {}}),
}));
jest.mock('@libs/Navigation/Navigation', () => ({__esModule: true, default: {navigate: jest.fn()}}));
jest.mock('@navigation/Navigation', () => ({__esModule: true, default: {navigate: jest.fn()}}));
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
    });

    it('returns company card users to the company card feed selector', () => {
        render(
            <WorkspaceCompanyCardAddWorkEmailPage
                // @ts-expect-error - Test only needs route parameters read by this screen.
                route={{name: SCREENS.WORKSPACE.COMPANY_CARD_ADD_WORK_EMAIL, key: 'company-card-add-work-email', params: {policyID: POLICY_ID}}}
            />,
        );

        fireEvent.press(screen.getByTestId('addWorkEmailButton'));

        expect(Navigation.navigate).toHaveBeenCalledWith(`${ROUTES.WORKSPACE_COMPANY_CARDS_SELECT_FEED.getRoute(POLICY_ID)}/contact-methods`);
    });

    it('returns Expensify Card users to the Expensify Card feed selector', () => {
        render(
            <WorkspaceExpensifyCardAddWorkEmailPage
                // @ts-expect-error - Test only needs route parameters read by this screen.
                route={{name: SCREENS.WORKSPACE.EXPENSIFY_CARD_ADD_WORK_EMAIL, key: 'expensify-card-add-work-email', params: {policyID: POLICY_ID}}}
            />,
        );

        fireEvent.press(screen.getByTestId('addWorkEmailButton'));

        expect(Navigation.navigate).toHaveBeenCalledWith(`${ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(POLICY_ID)}/select-feed/contact-methods`);
    });
});
