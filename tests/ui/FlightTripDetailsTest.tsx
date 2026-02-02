import {render, screen} from '@testing-library/react-native';
import FlightTripDetails from '@pages/Travel/FlightTripDetails';
import CONST from '@src/CONST';
import type {Reservation} from '@src/types/onyx/Transaction';

jest.mock('@hooks/useScreenWrapperTransitionStatus', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: () => ({
        didScreenTransitionEnd: true,
    }),
}));

const mockFlightReservation: Reservation = {
    company: {
        shortName: 'AS',
        phone: '',
        longName: 'Alaska Airlines, Inc.',
    },
    start: {
        date: '2026-01-25T10:08:00Z',
        shortName: 'DEN',
        longName: 'Denver Intl',
        cityName: 'Denver, CO, USA',
    },
    end: {
        date: '2026-01-25T11:58:00Z',
        shortName: 'SFO',
        longName: 'San Francisco Intl',
        cityName: 'San Francisco, CA, USA',
    },
    route: {
        number: '725',
        airlineCode: 'AS725',
        class: 'ECONOMY',
    },
    confirmations: [
        {
            name: 'Confirmation Number',
            value: 'CONF123',
        },
    ],
    seatNumber: '18D',
    type: CONST.RESERVATION_TYPE.FLIGHT,
    duration: 6600,
    travelerPersonalInfo: {
        name: 'John Doe',
        email: 'john.doe@example.com',
    },
};

describe('FlightTripDetailsTest', () => {
    it('should display the actual seat number correctly', () => {
        render(
            <FlightTripDetails
                reservation={mockFlightReservation}
                prevReservation={undefined}
                personalDetails={undefined}
            />,
        );

        const seatElement = screen.getByTestId(CONST.FLIGHT_SEAT_TEST_ID);
        expect(seatElement).toHaveTextContent('18D');
        expect(seatElement).not.toHaveTextContent('725');
    });

    it('should not display seat section when seatNumber is empty', () => {
        const reservationWithoutSeat: Reservation = {
            ...mockFlightReservation,
            seatNumber: undefined,
        };

        render(
            <FlightTripDetails
                reservation={reservationWithoutSeat}
                prevReservation={undefined}
                personalDetails={undefined}
            />,
        );

        // The seat field should not be rendered when there's no seat number
        expect(screen.queryByTestId(CONST.FLIGHT_SEAT_TEST_ID)).toBeNull();
    });

    it('should still not display flight number as seat when seatNumber is empty', () => {
        const reservationWithoutSeat: Reservation = {
            ...mockFlightReservation,
            seatNumber: undefined,
        };

        render(
            <FlightTripDetails
                reservation={reservationWithoutSeat}
                prevReservation={undefined}
                personalDetails={undefined}
            />,
        );

        expect(screen.queryByTestId(CONST.FLIGHT_SEAT_TEST_ID)).toBeNull();
    });
});
