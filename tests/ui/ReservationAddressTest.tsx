import {render, screen} from '@testing-library/react-native';
import {ReservationView} from '@components/ReportActionItem/TripDetailsView';
import StringUtils from '@libs/StringUtils';
import {getTripReservationCode} from '@libs/TripReservationUtils';
import HotelTripDetails from '@pages/Travel/HotelTripDetails';
import CONST from '@src/CONST';

const mockReservationData = {
    reservation: {
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
};

describe('ReservationAddressTest', () => {
    it('ReservationView should render the reservation address without double quotes', () => {
        render(
            <ReservationView
                reservation={mockReservationData.reservation}
                transactionID={mockReservationData.transactionID}
                tripRoomReportID={mockReservationData.reportID}
                reservationIndex={mockReservationData.reservationIndex}
            />,
        );

        const expectedAddress = `${getTripReservationCode(mockReservationData.reservation)}${StringUtils.removeDoubleQuotes(mockReservationData.reservation.start.address)}`;
        expect(screen.getByTestId(CONST.RESERVATION_ADDRESS_TEST_ID)).toHaveTextContent(expectedAddress);
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
