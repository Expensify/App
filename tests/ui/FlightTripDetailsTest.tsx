import {render, screen} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';

import FlightTripDetails from '@pages/Travel/FlightTripDetails';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Reservation} from '@src/types/onyx/Transaction';

import type ReactNative from 'react-native';

import React from 'react';
import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@hooks/useScreenWrapperTransitionStatus', () => ({
    __esModule: true,
    default: () => ({
        didScreenTransitionEnd: true,
    }),
}));

jest.mock('@components/RenderHTML', () => {
    const ReactMock = jest.requireActual<typeof React>('react');
    const {Text} = jest.requireActual<typeof ReactNative>('react-native');

    return ({html}: {html: string}) => ReactMock.createElement(Text, null, html.replaceAll(/<[^>]*>/g, ''));
});

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
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    it.each(['start', 'end'] as const)('should preserve flight details when the %s date is missing', (missingDate) => {
        // Given a flight reservation with one date omitted by the travel provider
        const reservation: Reservation = {...mockFlightReservation, [missingDate]: {...mockFlightReservation[missingDate], date: ''}};

        // When the traveler opens the flight details
        render(
            <FlightTripDetails
                reservation={reservation}
                prevConnectingFlight={undefined}
                personalDetails={undefined}
            />,
        );

        // Then available flight details remain visible instead of showing a crash screen
        expect(screen.getByTestId(CONST.FLIGHT_SEAT_TEST_ID)).toHaveTextContent('18D');
        expect(screen.getByText('CONF123')).toBeOnTheScreen();
    });

    it('should display the actual seat number correctly', () => {
        render(
            <FlightTripDetails
                reservation={mockFlightReservation}
                prevConnectingFlight={undefined}
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
                prevConnectingFlight={undefined}
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
                prevConnectingFlight={undefined}
                personalDetails={undefined}
            />,
        );

        expect(screen.queryByTestId(CONST.FLIGHT_SEAT_TEST_ID)).toBeNull();
    });

    it('should display the layover since the previous connecting flight landed', async () => {
        // Given a previous connecting flight that landed 1h 30m before this flight departs
        const prevConnectingFlight: Reservation = {
            ...mockFlightReservation,
            start: {...mockFlightReservation.start, date: '2026-01-25T06:00:00Z'},
            end: {...mockFlightReservation.end, date: '2026-01-25T08:38:00Z'},
        };

        // When the traveler opens the flight details
        render(
            <LocaleContextProvider>
                <FlightTripDetails
                    reservation={mockFlightReservation}
                    prevConnectingFlight={prevConnectingFlight}
                    personalDetails={undefined}
                />
            </LocaleContextProvider>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then the layover between the two flights is shown
        const layover = `1${TestHelper.translateLocal('common.hourAbbreviation')} 30${TestHelper.translateLocal('common.minuteAbbreviation')}`;
        const layoverText = TestHelper.translateLocal('travel.flightDetails.layover', layover).replaceAll(/<[^>]*>/g, '');
        expect(screen.getByText(layoverText)).toBeOnTheScreen();
    });
});
