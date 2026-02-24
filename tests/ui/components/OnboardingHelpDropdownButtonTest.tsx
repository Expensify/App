import {act, fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnboardingHelpDropdownButton from '@components/OnboardingHelpDropdownButton';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {openExternalLink} from '@libs/actions/Link';
import {cancelBooking, clearBookingDraft, rescheduleBooking} from '@libs/actions/ScheduleCall';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {translateLocal} from '../../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

// Mock the dependencies
jest.mock('@libs/actions/Link', () => ({
    openExternalLink: jest.fn(),
}));
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
}));
jest.mock('@libs/actions/ScheduleCall', () => ({
    clearBookingDraft: jest.fn(),
    rescheduleBooking: jest.fn(),
    cancelBooking: jest.fn(),
}));

jest.mock('@hooks/useResponsiveLayout', () => () => ({
    isSmallScreenWidth: false,
}));

const mockOpenExternalLink = jest.mocked(openExternalLink);
const mockNavigate = jest.mocked(Navigation.navigate);
const mockClearBookingDraft = jest.mocked(clearBookingDraft);
const mockRescheduleBooking = jest.mocked(rescheduleBooking);
const mockCancelBooking = jest.mocked(cancelBooking);

// Helper function to create mock events for PopoverMenuItem fireEvent.press
function createMockPressEvent(target: unknown) {
    return {
        nativeEvent: {},
        type: 'press',
        target,
        currentTarget: target,
    };
}

// Helper function to render OnboardingHelpDropdownButton with props
function renderOnboardingHelpDropdownButton(props: {
    reportID: string;
    shouldUseNarrowLayout: boolean;
    shouldShowRegisterForWebinar: boolean;
    shouldShowGuideBooking: boolean;
    hasActiveScheduledCall: boolean;
}) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <OnboardingHelpDropdownButton
                reportID={props.reportID}
                shouldUseNarrowLayout={props.shouldUseNarrowLayout}
                shouldShowRegisterForWebinar={props.shouldShowRegisterForWebinar}
                shouldShowGuideBooking={props.shouldShowGuideBooking}
                hasActiveScheduledCall={props.hasActiveScheduledCall}
            />
        </ComposeProviders>,
    );
}

const mockScheduledCall = {
    eventTime: '2025-07-05 10:00:00',
    id: 'call-id-123',
    status: CONST.SCHEDULE_CALL_STATUS.CREATED,
    host: 123,
    eventURI: 'test-uri',
    inserted: '2025-07-04 09:00:00',
};
const currentUserAccountID = 1;

describe('OnboardingHelpDropdownButton', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(async () => {
        await act(async () => {
            await Onyx.merge(ONYXKEYS.SESSION, {accountID: currentUserAccountID});
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('should display the schedule call option when guide booking is enabled', async () => {
        // Given component configured to show schedule call option only
        const props = {
            reportID: '1',
            shouldUseNarrowLayout: false,
            shouldShowRegisterForWebinar: false,
            shouldShowGuideBooking: true,
            hasActiveScheduledCall: false,
        };

        // When component is rendered
        renderOnboardingHelpDropdownButton(props);

        await waitForBatchedUpdatesWithAct();

        // Then only schedule call option is visible
        const scheduleCallOption = screen.getByText(translateLocal('getAssistancePage.scheduleACall'));
        expect(scheduleCallOption).toBeOnTheScreen();
        expect(screen.queryByText(translateLocal('getAssistancePage.registerForWebinar'))).not.toBeOnTheScreen();
        expect(screen.queryByText(translateLocal('common.reschedule'))).not.toBeOnTheScreen();
        expect(screen.queryByText(translateLocal('common.cancel'))).not.toBeOnTheScreen();

        // When schedule call option is pressed
        fireEvent.press(scheduleCallOption);

        await waitForBatchedUpdatesWithAct();

        // Then booking draft is cleared and navigation occurs
        expect(mockClearBookingDraft).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SCHEDULE_CALL_BOOK.getRoute(props.reportID));
    });

    it('should only display the registerForWebinar option when webinar is enabled', async () => {
        // Given component configured to display the registerForWebinar
        const props = {
            reportID: '1',
            shouldUseNarrowLayout: false,
            shouldShowRegisterForWebinar: true,
            shouldShowGuideBooking: false,
            hasActiveScheduledCall: false,
        };

        // When component is rendered
        renderOnboardingHelpDropdownButton(props);

        await waitForBatchedUpdatesWithAct();

        // Then only webinar registration option is visible
        const registerOption = screen.getByText(translateLocal('getAssistancePage.registerForWebinar'));
        expect(registerOption).toBeOnTheScreen();
        expect(screen.queryByText(translateLocal('getAssistancePage.scheduleACall'))).not.toBeOnTheScreen();
        expect(screen.queryByText(translateLocal('common.reschedule'))).not.toBeOnTheScreen();
        expect(screen.queryByText(translateLocal('common.cancel'))).not.toBeOnTheScreen();

        // When webinar registration option is pressed
        fireEvent.press(registerOption);

        await waitForBatchedUpdatesWithAct();

        // Then webinar registration URL is opened
        expect(mockOpenExternalLink).toHaveBeenCalledTimes(1);
        expect(mockOpenExternalLink).toHaveBeenCalledWith(CONST.REGISTER_FOR_WEBINAR_URL);
    });

    it('should display dropdown menu with all options when user has active scheduled call', async () => {
        // Given component configured with active scheduled call and webinar registration
        const props = {
            reportID: '1',
            shouldUseNarrowLayout: false,
            shouldShowRegisterForWebinar: true,
            shouldShowGuideBooking: false,
            hasActiveScheduledCall: true,
        };
        // Given scheduled call data exists in Onyx
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${props.reportID}`, {
                calendlyCalls: [mockScheduledCall],
            });
        });

        // When component is rendered
        renderOnboardingHelpDropdownButton(props);

        await waitForBatchedUpdatesWithAct();

        // Then dropdown button displays "Call scheduled" text
        const dropdownButton = screen.getByText(translateLocal('scheduledCall.callScheduled'));
        expect(dropdownButton).toBeOnTheScreen();

        await waitForBatchedUpdatesWithAct();

        // When dropdown menu is opened
        fireEvent.press(dropdownButton);

        await waitForBatchedUpdatesWithAct();

        // Then all expected menu options are present
        expect(screen.getByText(translateLocal('common.reschedule'))).toBeOnTheScreen();
        expect(screen.getByText(translateLocal('common.cancel'))).toBeOnTheScreen();
        expect(screen.getByText(translateLocal('getAssistancePage.registerForWebinar'))).toBeOnTheScreen();
        expect(screen.queryByText(translateLocal('getAssistancePage.scheduleACall'))).not.toBeOnTheScreen();
    });

    describe('dropdown actions with active scheduled call', () => {
        // Given component configured with active scheduled call and webinar registration enabled
        const props = {
            reportID: '1',
            shouldUseNarrowLayout: false,
            shouldShowRegisterForWebinar: true,
            shouldShowGuideBooking: false,
            hasActiveScheduledCall: true,
        };
        beforeEach(async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${props.reportID}`, {
                    calendlyCalls: [mockScheduledCall],
                });
            });
            await waitForBatchedUpdatesWithAct();
        });
        it('should open webinar registration URL when webinar option is pressed', async () => {
            // Given scheduled call data exists in Onyx
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${props.reportID}`, {
                    calendlyCalls: [mockScheduledCall],
                });
            });

            await waitForBatchedUpdatesWithAct();

            // When component is rendered and dropdown is opened
            renderOnboardingHelpDropdownButton(props);

            await waitForBatchedUpdatesWithAct();
            const dropdownButton = screen.getByText(translateLocal('scheduledCall.callScheduled'));
            fireEvent.press(dropdownButton);

            await waitForBatchedUpdatesWithAct();

            // When webinar menu item is pressed
            const webinarMenuItem = screen.getByText(translateLocal('getAssistancePage.registerForWebinar'));
            fireEvent.press(webinarMenuItem, createMockPressEvent(webinarMenuItem));

            await waitForBatchedUpdatesWithAct();

            // Then webinar registration URL is opened
            expect(mockOpenExternalLink).toHaveBeenCalledTimes(1);
            expect(mockOpenExternalLink).toHaveBeenCalledWith(CONST.REGISTER_FOR_WEBINAR_URL);
        });

        it('should call reschedule booking when reschedule option is pressed', async () => {
            // When component is rendered and dropdown is opened
            renderOnboardingHelpDropdownButton(props);

            await waitForBatchedUpdatesWithAct();
            const dropdownButton = screen.getByText(translateLocal('scheduledCall.callScheduled'));
            fireEvent.press(dropdownButton);

            await waitForBatchedUpdatesWithAct();

            // When reschedule option is pressed
            const rescheduleMenuItem = screen.getByText(translateLocal('common.reschedule'));
            fireEvent.press(rescheduleMenuItem, createMockPressEvent(rescheduleMenuItem));

            await waitForBatchedUpdatesWithAct();

            // Then reschedule booking action is called with scheduled call data
            expect(mockRescheduleBooking).toHaveBeenCalledTimes(1);
            expect(mockRescheduleBooking).toHaveBeenCalledWith(mockScheduledCall);
        });

        it('should call cancel booking when cancel option is pressed', async () => {
            // When component is rendered and dropdown is opened
            renderOnboardingHelpDropdownButton(props);

            await waitForBatchedUpdatesWithAct();
            const dropdownButton = screen.getByText(translateLocal('scheduledCall.callScheduled'));
            fireEvent.press(dropdownButton);

            await waitForBatchedUpdatesWithAct();

            // When cancel option is pressed
            const cancelMenuItem = screen.getByText(translateLocal('common.cancel'));
            fireEvent.press(cancelMenuItem, createMockPressEvent(cancelMenuItem));

            await waitForBatchedUpdatesWithAct();

            // Then cancel booking action is called with scheduled call data
            expect(mockCancelBooking).toHaveBeenCalledTimes(1);
            expect(mockCancelBooking).toHaveBeenCalledWith(mockScheduledCall);
        });
    });
});
