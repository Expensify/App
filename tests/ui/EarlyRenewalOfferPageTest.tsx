import {act, fireEvent, render, screen} from '@testing-library/react-native';

import {acceptEarlyRenewalOffer} from '@libs/actions/EarlyRenewalOffer';
import Navigation from '@libs/Navigation/Navigation';

import EarlyRenewalOfferPage from '@pages/settings/Subscription/EarlyRenewalOfferPage/index.web';

import CONST from '@src/CONST';

import React from 'react';

type SubmitButtonProps = {
    isAlertVisible: boolean;
    message: string;
    onSubmit: () => void;
};

let capturedSubmitButtonProps: SubmitButtonProps | undefined;

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

jest.mock('@hooks/useThemeIllustrations', () => jest.fn(() => ({})));

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyIllustrations: jest.fn(() => ({})),
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({})),
}));

jest.mock('@libs/actions/EarlyRenewalOffer', () => ({
    acceptEarlyRenewalOffer: jest.fn(),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
    getActiveRoute: jest.fn(() => ''),
}));

jest.mock('@components/ScreenWrapper', () => {
    function MockScreenWrapper({children}: {children: React.ReactNode}) {
        return children;
    }
    return MockScreenWrapper;
});

jest.mock('@components/HeaderWithBackButton', () => {
    function MockHeader() {
        return null;
    }
    return MockHeader;
});

jest.mock('@components/Icon', () => {
    function MockIcon() {
        return null;
    }
    return MockIcon;
});

jest.mock('@components/ImageSVG', () => {
    function MockImageSVG() {
        return null;
    }
    return MockImageSVG;
});

jest.mock('@components/FormAlertWithSubmitButton', () => {
    function MockSubmitButton({isAlertVisible, message, onSubmit}: SubmitButtonProps) {
        capturedSubmitButtonProps = {isAlertVisible, message, onSubmit};
        return null;
    }
    return MockSubmitButton;
});

describe('EarlyRenewalOfferPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        capturedSubmitButtonProps = undefined;
    });

    it('asks the billing owner to choose an option before renewing', async () => {
        // Given the billing owner opens the discount picker, which has no option preselected
        render(<EarlyRenewalOfferPage />);

        // When they press the renew button without choosing a discount
        await act(async () => {
            capturedSubmitButtonProps?.onSubmit();
            await Promise.resolve();
        });

        // Then they see an error above the button and no renewal is requested
        expect(capturedSubmitButtonProps?.isAlertVisible).toBe(true);
        expect(capturedSubmitButtonProps?.message).toBe('earlyRenewal.offer.chooseOptionError');
        expect(acceptEarlyRenewalOffer).not.toHaveBeenCalled();
    });

    it('renews with the chosen discount and closes the picker', async () => {
        // Given the billing owner has chosen the two-year discount and Auth accepts it
        jest.mocked(acceptEarlyRenewalOffer).mockResolvedValue({jsonCode: CONST.JSON_CODE.SUCCESS});
        render(<EarlyRenewalOfferPage />);
        fireEvent.press(screen.getByRole('radio', {name: 'earlyRenewal.offer.twoYears'}));

        // When they press the renew button
        await act(async () => {
            capturedSubmitButtonProps?.onSubmit();
            await Promise.resolve();
        });

        // Then only that offer is sent to Auth and the picker closes
        expect(acceptEarlyRenewalOffer).toHaveBeenCalledWith(CONST.SUBSCRIPTION.EARLY_RENEWAL.OFFER_ID.INCENTIVIZED_TWO_YEARS);
        expect(Navigation.goBack).toHaveBeenCalledTimes(1);
    });

    it('shows the error Auth returns when the renewal fails', async () => {
        // Given the billing owner has chosen the one-year discount but Auth rejects it
        jest.mocked(acceptEarlyRenewalOffer).mockResolvedValue({jsonCode: 402, message: 'This offer is no longer available.'});
        render(<EarlyRenewalOfferPage />);
        fireEvent.press(screen.getByRole('radio', {name: 'earlyRenewal.offer.oneYear'}));

        // When they press the renew button
        await act(async () => {
            capturedSubmitButtonProps?.onSubmit();
            await Promise.resolve();
        });

        // Then the picker stays open and shows why, so they can try again
        expect(capturedSubmitButtonProps?.message).toBe('This offer is no longer available.');
        expect(Navigation.goBack).not.toHaveBeenCalled();
    });
});
