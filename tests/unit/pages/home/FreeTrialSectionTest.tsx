import {render} from '@testing-library/react-native';
import React from 'react';
import DateUtils from '@libs/DateUtils';
import FreeTrialSection from '@pages/home/FreeTrialSection';
import type {FreeTrialState} from '@pages/home/FreeTrialSection/useFreeTrial';
import useFreeTrial from '@pages/home/FreeTrialSection/useFreeTrial';

jest.mock('@pages/home/FreeTrialSection/useFreeTrial');
jest.mock('@libs/DateUtils', () => ({
    formatCountdownTimer: jest.fn(() => '12:34:56'),
}));
jest.mock('@libs/Navigation/Navigation');
jest.mock('@hooks/useResponsiveLayout', () => jest.fn(() => ({shouldUseNarrowLayout: false})));
jest.mock('@hooks/useTheme', () => jest.fn(() => ({trialBannerBackgroundColor: '#ffffff', trialTimer: '#00ff00'})));
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
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyIllustrations: jest.fn(() => ({
        TreasureChest: 1,
    })),
}));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string, params?: Record<string, number | string>) => {
            switch (key) {
                case 'homePage.freeTrialSection.title':
                    return `Free trial: ${params?.days} days left!`;
                case 'homePage.freeTrialSection.offer50Body':
                    return 'Get 50% off your first year!';
                case 'homePage.freeTrialSection.offer25Body':
                    return 'Get 25% off your first year!';
                case 'homePage.freeTrialSection.addCardBody':
                    return "Don't wait! Add your payment card now.";
                case 'homePage.freeTrialSection.ctaClaim':
                    return 'Claim';
                case 'homePage.freeTrialSection.ctaAdd':
                    return 'Add card';
                case 'homePage.freeTrialSection.timeRemaining':
                    return `Time remaining: ${params?.formattedTime}`;
                case 'homePage.freeTrialSection.timeRemainingDays':
                    return `Time remaining: ${params?.count} ${params?.count === 1 ? 'day' : 'days'}`;
                default:
                    return key;
            }
        },
    })),
);
jest.mock('@components/Button', () => {
    function MockButton({text}: {text: string}) {
        return text;
    }

    return MockButton;
});
jest.mock('@components/Icon', () => {
    function MockIcon() {
        return null;
    }

    return MockIcon;
});
jest.mock('@components/Pressable', () => ({
    PressableWithoutFeedback: ({children}: {children: React.ReactNode}) => children,
}));
jest.mock('@components/Text', () => {
    function MockText({children}: {children: React.ReactNode}) {
        return children;
    }

    return MockText;
});
jest.mock('@components/WidgetContainer', () => {
    function MockWidgetContainer({title, children}: {title: string; children: React.ReactNode}) {
        return (
            <>
                {title}
                {children}
            </>
        );
    }

    return MockWidgetContainer;
});

const mockedUseFreeTrial = jest.mocked(useFreeTrial);
const mockedFormatCountdownTimer = jest.mocked(DateUtils.formatCountdownTimer);
const defaultFreeTrialState: FreeTrialState = {
    shouldShowFreeTrialSection: true,
    discountType: 50,
    daysLeft: 10,
    discountInfo: {discountType: 50, days: 0, hours: 12, minutes: 34, seconds: 56},
};

const renderFreeTrialSection = () => render(<FreeTrialSection />);

describe('FreeTrialSection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedFormatCountdownTimer.mockReturnValue('12:34:56');
        mockedUseFreeTrial.mockReturnValue(defaultFreeTrialState);
    });

    it('renders the timer subtitle for the 50% discount phase', () => {
        const {toJSON} = renderFreeTrialSection();

        expect(JSON.stringify(toJSON())).toContain('Time remaining: 12:34:56');
        expect(mockedFormatCountdownTimer).toHaveBeenCalledTimes(1);
    });

    it('renders the day-based subtitle for the 25% discount phase while full days remain', () => {
        mockedUseFreeTrial.mockReturnValue({
            ...defaultFreeTrialState,
            discountType: 25,
            discountInfo: {discountType: 25, days: 3, hours: 12, minutes: 34, seconds: 56},
        });

        const {toJSON} = renderFreeTrialSection();

        expect(JSON.stringify(toJSON())).toContain('Time remaining: 3 days');
        expect(mockedFormatCountdownTimer).not.toHaveBeenCalled();
    });

    it('falls back to the timer subtitle for the 25% discount phase once less than one day remains', () => {
        mockedUseFreeTrial.mockReturnValue({
            ...defaultFreeTrialState,
            discountType: 25,
            discountInfo: {discountType: 25, days: 0, hours: 12, minutes: 34, seconds: 56},
        });

        const {toJSON} = renderFreeTrialSection();

        expect(JSON.stringify(toJSON())).toContain('Time remaining: 12:34:56');
        expect(mockedFormatCountdownTimer).toHaveBeenCalledTimes(1);
    });

    it('does not render a subtitle when no discount is available', () => {
        mockedUseFreeTrial.mockReturnValue({
            ...defaultFreeTrialState,
            discountType: null,
            discountInfo: null,
        });

        const {toJSON} = renderFreeTrialSection();

        expect(JSON.stringify(toJSON())).not.toContain('Time remaining: 12:34:56');
        expect(JSON.stringify(toJSON())).not.toContain('Time remaining: 3 days');
        expect(mockedFormatCountdownTimer).not.toHaveBeenCalled();
    });
});
