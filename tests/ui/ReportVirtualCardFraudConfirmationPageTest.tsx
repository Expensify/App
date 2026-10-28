import {fireEvent, render, screen} from '@testing-library/react-native';

import useDynamicBackPath from '@hooks/useDynamicBackPath';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import ReportVirtualCardFraudConfirmationPage from '@pages/settings/Wallet/ReportVirtualCardFraudConfirmationPage';

import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';

import React from 'react';

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);

jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(
        () =>
            new Proxy(
                {},
                {
                    get: () => ({}),
                },
            ),
    ),
);

jest.mock('@hooks/useOnyx', () => jest.fn(() => [undefined]));

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({})),
}));

jest.mock('@hooks/useDynamicBackPath', () => jest.fn());

jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
    dismissModal: jest.fn(),
}));

jest.mock('@components/ScreenWrapper', () => {
    function MockScreenWrapper({children}: {children: React.ReactNode}) {
        return children;
    }
    return MockScreenWrapper;
});

jest.mock('@components/HeaderWithBackButton', () => {
    function MockHeader({title}: {title: string}) {
        return title;
    }
    return MockHeader;
});

jest.mock('@components/ImageSVG', () => () => null);

jest.mock('@components/Button', () => {
    const {Pressable, Text} = jest.requireActual<Record<string, React.ComponentType<{role?: string; onPress?: () => void; children?: React.ReactNode}>>>('react-native');
    function MockButton({onPress, children}: {onPress: () => void; children: React.ReactNode}) {
        return (
            <Pressable
                role="button"
                onPress={onPress}
            >
                {children}
            </Pressable>
        );
    }
    MockButton.Text = Text;
    return MockButton;
});

const OLD_CARD_ID = '111';
const NEW_CARD_ID = '222';

function renderPage() {
    return render(
        <ReportVirtualCardFraudConfirmationPage
            // @ts-expect-error -- Only the route params are read by the page.
            route={{params: {cardID: NEW_CARD_ID}}}
        />,
    );
}

describe('ReportVirtualCardFraudConfirmationPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('opens the replacement card when the fraud page is still under the confirmation', () => {
        // Given a successful report from the Wallet card, which leaves the fraud page of the old card under the confirmation
        const oldCardPath = createDynamicRoute(DYNAMIC_ROUTES.WALLET_DOMAIN_CARD.getRoute(OLD_CARD_ID), ROUTES.SETTINGS_WALLET);
        jest.mocked(useDynamicBackPath).mockReturnValue(createDynamicRoute(DYNAMIC_ROUTES.WALLET_CARD_REPORT_FRAUD.getRoute(OLD_CARD_ID), oldCardPath));
        renderPage();

        // When the user closes the confirmation
        fireEvent.press(screen.getByText('reportFraudConfirmationPage.buttonText'));

        // Then it goes to the replacement card on the Wallet instead of back to the fraud page
        expect(Navigation.goBack).toHaveBeenCalledWith(createDynamicRoute(DYNAMIC_ROUTES.WALLET_DOMAIN_CARD.getRoute(NEW_CARD_ID), ROUTES.SETTINGS_WALLET), {compareParams: false});
    });

    it('opens the replacement card when the confirmation sits right on the card page', () => {
        // Given a confirmation opened straight over the old card, as after a refresh or an old link
        jest.mocked(useDynamicBackPath).mockReturnValue(createDynamicRoute(DYNAMIC_ROUTES.WALLET_DOMAIN_CARD.getRoute(OLD_CARD_ID), ROUTES.HOME));
        renderPage();

        // When the user closes the confirmation
        fireEvent.press(screen.getByText('reportFraudConfirmationPage.buttonText'));

        // Then it still points the card page at the replacement card and keeps Home under it
        expect(Navigation.goBack).toHaveBeenCalledWith(createDynamicRoute(DYNAMIC_ROUTES.WALLET_DOMAIN_CARD.getRoute(NEW_CARD_ID), ROUTES.HOME), {compareParams: false});
    });
});
