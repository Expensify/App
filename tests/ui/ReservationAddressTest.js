"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("@testing-library/react-native");
var TripDetailsView_1 = require("@components/ReportActionItem/TripDetailsView");
var StringUtils_1 = require("@libs/StringUtils");
var TripReservationUtils_1 = require("@libs/TripReservationUtils");
var HotelTripDetails_1 = require("@pages/Travel/HotelTripDetails");
var CONST_1 = require("@src/CONST");
jest.mock('@hooks/useScreenWrapperTransitionStatus', function () { return ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: function () { return ({
        didScreenTransitionEnd: true, // or false, depending on your desired behavior
    }); },
}); });
var mockReservationData = {
    reservation: {
        cancellationDeadline: '2025-04-02T19:00:00-05:00',
        cancellationPolicy: CONST_1.default.CANCELLATION_POLICY.PARTIALLY_REFUNDABLE,
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
        type: CONST_1.default.RESERVATION_TYPE.HOTEL,
        duration: 1000,
    },
    transactionID: '2101152939974863962',
    reportID: '8884312680252586',
    reservationIndex: 0,
    sequenceIndex: 0,
};
describe('ReservationAddressTest', function () {
    it('ReservationView should render the reservation address without double quotes', function () {
        (0, react_native_1.render)(<TripDetailsView_1.ReservationView reservation={mockReservationData.reservation} transactionID={mockReservationData.transactionID} tripRoomReportID={mockReservationData.reportID} sequenceIndex={mockReservationData.sequenceIndex}/>);
        var expectedAddress = "".concat((0, TripReservationUtils_1.getTripReservationCode)(mockReservationData.reservation)).concat(StringUtils_1.default.removeDoubleQuotes(mockReservationData.reservation.start.address));
        expect(react_native_1.screen.getByTestId(CONST_1.default.RESERVATION_ADDRESS_TEST_ID)).toHaveTextContent(expectedAddress);
    });
    it('HotelTripDetails should render the reservation address without double quotes', function () {
        (0, react_native_1.render)(<HotelTripDetails_1.default reservation={mockReservationData.reservation} personalDetails={undefined}/>);
        expect(react_native_1.screen.getByTestId(CONST_1.default.RESERVATION_ADDRESS_TEST_ID)).toHaveTextContent(StringUtils_1.default.removeDoubleQuotes(mockReservationData.reservation.start.address));
    });
});
