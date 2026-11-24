import {fireEvent, render, screen} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {ReservationView} from '@components/ReportActionItem/TripDetailsView';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import StringUtils from '@libs/StringUtils';
import {getTripReservationCode} from '@libs/TripReservationUtils';

import HotelTripDetails from '@pages/Travel/HotelTripDetails';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

jest.mock('@hooks/useScreenWrapperTransitionStatus', () => ({
    __esModule: true,
    default: () => ({
        didScreenTransitionEnd: true,
    }),
}));

const mockReservationData = {
    reservation: {
        reservationID: 'reservation-1',
        cancellationDeadline: '2025-04-02T19:00:00-05:00',
        cancellationPolicy: CONST.CANCELLATION_POLICY.PARTIALLY_REFUNDABLE,
        confirmations: [
            {
                name: 'Itinerary Number',
                value: '0',
            },
        ],
        end: {
            address: '"500 E 105TH ST"\n64131, KANSAS CITY, MO, US',
            date: '2025-04-10T12:00:00',
            longName: 'Courtyard By Marriott Kansas City South',
        },
        paymentType: 'PAY_AT_HOTEL',
        roomClass: 'Small Room',
        start: {
            address: '"500 E 105TH ST"\n64131, KANSAS CITY, MO, US',
            date: '2025-04-03T15:00:00',
            longName: 'Courtyard By Marriott Kansas City South',
        },
        travelerPersonalInfo: {
            email: 'blimpich+travel@expensifail.com',
            name: 'Ben Limpich',
        },
        type: CONST.RESERVATION_TYPE.HOTEL,
        duration: 1000,
    },
    transactionID: '2101152939974863962',
    reportID: '8884312680252586',
    reservationIndex: 0,
    sequenceIndex: 0,
};

describe('ReservationAddressTest', () => {
    it('ReservationView should render the reservation address without double quotes', () => {
        render(
            <ReservationView
                reservation={mockReservationData.reservation}
                transactionID={mockReservationData.transactionID}
                tripRoomReportID={mockReservationData.reportID}
                sequenceIndex={mockReservationData.sequenceIndex}
            />,
            {wrapper: OnyxListItemProvider},
        );

        const expectedAddress = `${getTripReservationCode(mockReservationData.reservation)}${StringUtils.removeDoubleQuotes(mockReservationData.reservation.start.address)}`;
        expect(screen.getByTestId(CONST.RESERVATION_ADDRESS_TEST_ID)).toHaveTextContent(expectedAddress);
    });

    it('keeps the reservation row linked to its exact trip detail route', () => {
        // Given a reservation with transaction, report and sequence identifiers.
        const navigate = jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});
        render(
            <ReservationView
                reservation={mockReservationData.reservation}
                transactionID={mockReservationData.transactionID}
                tripRoomReportID={mockReservationData.reportID}
                sequenceIndex={mockReservationData.sequenceIndex}
            />,
            {wrapper: OnyxListItemProvider},
        );

        // When the reservation row is activated.
        fireEvent.press(screen.getByRole('button'), {nativeEvent: {}});

        // Then migration does not change the reservation editor destination or its arguments.
        expect(navigate).toHaveBeenCalledWith(
            createDynamicRoute(
                DYNAMIC_ROUTES.TRAVEL_TRIP_DETAILS.getRoute(
                    mockReservationData.reportID,
                    mockReservationData.transactionID,
                    mockReservationData.reservation.reservationID,
                    mockReservationData.sequenceIndex,
                ),
            ),
        );
        navigate.mockRestore();
    });

    it('HotelTripDetails should render the reservation address without double quotes', () => {
        render(
            <HotelTripDetails
                reservation={mockReservationData.reservation}
                personalDetails={undefined}
            />,
        );

        expect(screen.getByTestId(CONST.RESERVATION_ADDRESS_TEST_ID)).toHaveTextContent(StringUtils.removeDoubleQuotes(mockReservationData.reservation.start.address));
    });
});
