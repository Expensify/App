"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTripReservationIcon = getTripReservationIcon;
exports.getTripEReceiptIcon = getTripEReceiptIcon;
exports.getTripReservationCode = getTripReservationCode;
exports.getReservationsFromTripReport = getReservationsFromTripReport;
exports.getTripTotal = getTripTotal;
exports.getReservationDetailsFromSequence = getReservationDetailsFromSequence;
var Expensicons = require("@src/components/Icon/Expensicons");
var CONST_1 = require("@src/CONST");
var ReportUtils_1 = require("./ReportUtils");
function getTripReservationIcon(reservationType) {
    switch (reservationType) {
        case CONST_1.default.RESERVATION_TYPE.FLIGHT:
            return Expensicons.Plane;
        case CONST_1.default.RESERVATION_TYPE.HOTEL:
            return Expensicons.Bed;
        case CONST_1.default.RESERVATION_TYPE.CAR:
            return Expensicons.CarWithKey;
        case CONST_1.default.RESERVATION_TYPE.TRAIN:
            return Expensicons.Train;
        default:
            return Expensicons.Luggage;
    }
}
function getReservationsFromTripTransactions(transactions) {
    return transactions
        .flatMap(function (item) {
        var _a, _b, _c;
        return (_c = (_b = (_a = item === null || item === void 0 ? void 0 : item.receipt) === null || _a === void 0 ? void 0 : _a.reservationList) === null || _b === void 0 ? void 0 : _b.map(function (reservation, reservationIndex) { return ({
            reservation: reservation,
            transactionID: item.transactionID,
            reportID: item.reportID,
            reservationIndex: reservationIndex,
            sequenceIndex: reservationIndex,
        }); })) !== null && _c !== void 0 ? _c : [];
    })
        .sort(function (a, b) { return new Date(a.reservation.start.date).getTime() - new Date(b.reservation.start.date).getTime(); });
}
function getTripEReceiptIcon(transaction) {
    var _a, _b, _c;
    var reservationType = transaction ? (_c = (_b = (_a = transaction.receipt) === null || _a === void 0 ? void 0 : _a.reservationList) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.type : '';
    switch (reservationType) {
        case CONST_1.default.RESERVATION_TYPE.FLIGHT:
        case CONST_1.default.RESERVATION_TYPE.CAR:
            return Expensicons.Plane;
        case CONST_1.default.RESERVATION_TYPE.HOTEL:
            return Expensicons.Bed;
        default:
            return undefined;
    }
}
/**
 * Extracts the confirmation code from a reservation
 */
function getTripReservationCode(reservation) {
    var _a, _b;
    return "".concat(reservation.confirmations && ((_a = reservation.confirmations) === null || _a === void 0 ? void 0 : _a.length) > 0 ? "".concat((_b = reservation.confirmations.at(0)) === null || _b === void 0 ? void 0 : _b.value, " \u2022 ") : '');
}
function parseDurationToSeconds(duration) {
    var regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
    var matches = duration.match(regex);
    if (!matches) {
        return 0;
    }
    var hours = parseInt(matches[1] || '0', 10);
    var minutes = parseInt(matches[2] || '0', 10);
    var seconds = parseInt(matches[3] || '0', 10);
    return hours * 3600 + minutes * 60 + seconds;
}
function getSeatByLegAndFlight(travelerInfo, legIdx, flightIdx) {
    var _a, _b;
    var seats = (_b = (_a = travelerInfo.booking) === null || _a === void 0 ? void 0 : _a.seats) === null || _b === void 0 ? void 0 : _b.filter(function (seat) { return seat.legIdx === legIdx && seat.flightIdx === flightIdx; });
    if (seats && seats.length > 0) {
        return seats.join(', ');
    }
    return '';
}
function getTravelerName(traveler) {
    if (!(traveler === null || traveler === void 0 ? void 0 : traveler.name)) {
        return '';
    }
    var name = traveler.name.family1;
    if (traveler.name.family2) {
        name += " ".concat(traveler.name.family2);
    }
    if (traveler.name.middle) {
        name += " ".concat(traveler.name.middle);
    }
    if (traveler.name.given) {
        name += " ".concat(traveler.name.given);
    }
    return name.trim();
}
function getAddressFromLocation(location, type) {
    var address = '';
    if (location.addressLines) {
        address += location.addressLines.join(', ');
    }
    if (type === CONST_1.default.RESERVATION_TYPE.CAR) {
        return address.trim();
    }
    if (location.postalCode) {
        address += " ".concat(location.postalCode);
    }
    if (location.locality) {
        address += ", ".concat(location.locality);
    }
    if (location.administrativeArea) {
        address += ", ".concat(location.administrativeArea);
    }
    if (location.regionCode) {
        address += ", ".concat(location.regionCode);
    }
    return address.trim();
}
function findTravelerInfo(travelers, userId) {
    var _a;
    return (_a = travelers.find(function (travelerData) { return travelerData.userId.id === userId; })) === null || _a === void 0 ? void 0 : _a.personalInfo;
}
function getAirReservations(pnr, travelers) {
    var _a, _b, _c, _d;
    var reservationList = [];
    if (!pnr.data.airPnr) {
        return [];
    }
    var pnrData = pnr.data.airPnr;
    var airlineInfo = (_b = (_a = pnr.data.additionalMetadata) === null || _a === void 0 ? void 0 : _a.airlineInfo) !== null && _b !== void 0 ? _b : [];
    var airports = (_d = (_c = pnr.data.additionalMetadata) === null || _c === void 0 ? void 0 : _c.airportInfo) !== null && _d !== void 0 ? _d : [];
    pnrData.travelerInfos.forEach(function (travelerInfo) {
        travelerInfo.tickets.forEach(function (ticket) {
            var flightCoupons = ticket.flightCoupons;
            flightCoupons.forEach(function (flightDetails, index) {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
                var legIdx = flightDetails.legIdx;
                var flightIdx = flightDetails.flightIdx;
                var flightObject = (_b = (_a = pnrData.legs) === null || _a === void 0 ? void 0 : _a.at(legIdx)) === null || _b === void 0 ? void 0 : _b.flights.at(flightIdx);
                var airlineCode = flightObject === null || flightObject === void 0 ? void 0 : flightObject.marketing.airlineCode;
                var longAirlineName = (_d = (_c = airlineInfo.find(function (info) { return info.airlineCode === airlineCode; })) === null || _c === void 0 ? void 0 : _c.airlineName) !== null && _d !== void 0 ? _d : airlineCode;
                var company = {
                    shortName: airlineCode !== null && airlineCode !== void 0 ? airlineCode : '',
                    phone: '',
                    longName: longAirlineName !== null && longAirlineName !== void 0 ? longAirlineName : '',
                };
                var origin = flightObject === null || flightObject === void 0 ? void 0 : flightObject.origin;
                var originAirport = airports.find(function (airport) { return airport.airportCode === origin; });
                var start = {
                    date: (_f = (_e = flightObject === null || flightObject === void 0 ? void 0 : flightObject.departureDateTime) === null || _e === void 0 ? void 0 : _e.iso8601) !== null && _f !== void 0 ? _f : '',
                    timezoneOffset: '',
                    shortName: origin,
                    longName: (_g = originAirport === null || originAirport === void 0 ? void 0 : originAirport.airportName) !== null && _g !== void 0 ? _g : origin,
                    cityName: "".concat(originAirport === null || originAirport === void 0 ? void 0 : originAirport.cityName, ", ").concat(originAirport === null || originAirport === void 0 ? void 0 : originAirport.stateCode, ", ").concat(originAirport === null || originAirport === void 0 ? void 0 : originAirport.countryName),
                };
                var dest = flightObject === null || flightObject === void 0 ? void 0 : flightObject.destination;
                var destAirport = airports.find(function (airport) { return airport.airportCode === dest; });
                var end = {
                    date: (_j = (_h = flightObject === null || flightObject === void 0 ? void 0 : flightObject.arrivalDateTime) === null || _h === void 0 ? void 0 : _h.iso8601) !== null && _j !== void 0 ? _j : '',
                    timezoneOffset: '',
                    shortName: dest,
                    longName: (_k = destAirport === null || destAirport === void 0 ? void 0 : destAirport.airportName) !== null && _k !== void 0 ? _k : dest,
                    cityName: "".concat(destAirport === null || destAirport === void 0 ? void 0 : destAirport.cityName, ", ").concat(destAirport === null || destAirport === void 0 ? void 0 : destAirport.stateCode, ", ").concat(destAirport === null || destAirport === void 0 ? void 0 : destAirport.countryName),
                };
                var route = {
                    number: (_l = flightObject === null || flightObject === void 0 ? void 0 : flightObject.marketing.num) !== null && _l !== void 0 ? _l : '',
                    airlineCode: "".concat(flightObject === null || flightObject === void 0 ? void 0 : flightObject.marketing.airlineCode).concat(flightObject === null || flightObject === void 0 ? void 0 : flightObject.marketing.num),
                    class: flightObject === null || flightObject === void 0 ? void 0 : flightObject.cabin,
                };
                var confirmations = [
                    {
                        name: 'Confirmation Number',
                        value: (_m = flightObject === null || flightObject === void 0 ? void 0 : flightObject.vendorConfirmationNumber) !== null && _m !== void 0 ? _m : '',
                    },
                ];
                var traveler = findTravelerInfo(travelers, travelerInfo.userId.id);
                var reservationObject = {
                    company: company,
                    start: start,
                    end: end,
                    route: route,
                    confirmations: confirmations,
                    arrivalGate: flightObject === null || flightObject === void 0 ? void 0 : flightObject.arrivalGate,
                    seatNumber: getSeatByLegAndFlight(travelerInfo, legIdx, flightIdx),
                    type: CONST_1.default.RESERVATION_TYPE.FLIGHT,
                    duration: parseDurationToSeconds((_o = flightObject === null || flightObject === void 0 ? void 0 : flightObject.duration.iso8601) !== null && _o !== void 0 ? _o : ''),
                    reservationID: pnr.pnrId,
                    travelerPersonalInfo: {
                        name: getTravelerName(traveler),
                        email: (_p = traveler === null || traveler === void 0 ? void 0 : traveler.email) !== null && _p !== void 0 ? _p : '',
                    },
                };
                reservationList.push({ reservation: reservationObject, reservationIndex: index });
            });
        });
    });
    return reservationList;
}
function getHotelReservations(pnr, travelers) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    var reservationList = [];
    if (!pnr.data.hotelPnr) {
        return [];
    }
    var pnrData = pnr.data.hotelPnr;
    var confirmations = [
        {
            name: 'Confirmation Number',
            value: pnrData.vendorConfirmationNumber,
        },
    ];
    var travelerInfo = pnrData.travelerInfos.at(0);
    var traveler = findTravelerInfo(travelers, travelerInfo === null || travelerInfo === void 0 ? void 0 : travelerInfo.userId.id);
    reservationList.push({
        reservationIndex: 0,
        reservation: {
            reservationID: pnr.pnrId,
            start: {
                date: (_a = pnrData.checkInDateTime) === null || _a === void 0 ? void 0 : _a.iso8601,
                address: getAddressFromLocation(pnrData.hotelInfo.address),
                longName: pnrData.hotelInfo.name,
                shortName: pnrData.hotelInfo.chainCode,
                cityName: pnrData.hotelInfo.chainName,
            },
            end: {
                date: (_b = pnrData.checkOutDateTime) === null || _b === void 0 ? void 0 : _b.iso8601,
                address: getAddressFromLocation(pnrData.hotelInfo.address),
                longName: pnrData.hotelInfo.name,
                shortName: pnrData.hotelInfo.chainCode,
                cityName: pnrData.hotelInfo.chainName,
            },
            type: CONST_1.default.RESERVATION_TYPE.HOTEL,
            company: { longName: pnrData.hotelInfo.chainName },
            duration: 0,
            numberOfRooms: pnrData.numberOfRooms,
            roomClass: pnrData.room.roomName,
            cancellationPolicy: (_d = (_c = pnrData.room.cancellationPolicy) === null || _c === void 0 ? void 0 : _c.policy) !== null && _d !== void 0 ? _d : null,
            cancellationDeadline: (_g = (_f = (_e = pnrData.room.cancellationPolicy) === null || _e === void 0 ? void 0 : _e.deadline) === null || _f === void 0 ? void 0 : _f.iso8601) !== null && _g !== void 0 ? _g : null,
            confirmations: confirmations,
            travelerPersonalInfo: {
                name: getTravelerName(traveler),
                email: (_h = traveler === null || traveler === void 0 ? void 0 : traveler.email) !== null && _h !== void 0 ? _h : '',
            },
        },
    });
    return reservationList;
}
function getCarReservations(pnr, travelers) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    var reservationList = [];
    if (!pnr.data.carPnr) {
        return [];
    }
    var pnrData = pnr.data.carPnr;
    var confirmations = [
        {
            name: 'Confirmation Number',
            value: pnrData.vendorConfirmationNumber,
        },
    ];
    var traveler = (_a = travelers.at(0)) === null || _a === void 0 ? void 0 : _a.personalInfo;
    var pickupLocation = pnrData.carInfo.pickupLocation.address;
    var dropLocation = pnrData.carInfo.dropOffLocation.address;
    reservationList.push({
        reservationIndex: 0,
        reservation: {
            reservationID: pnr.pnrId,
            start: {
                date: (_b = pnrData.pickupDateTime) === null || _b === void 0 ? void 0 : _b.iso8601,
                location: getAddressFromLocation(pickupLocation, CONST_1.default.RESERVATION_TYPE.CAR),
            },
            end: {
                date: (_c = pnrData.dropOffDateTime) === null || _c === void 0 ? void 0 : _c.iso8601,
                location: getAddressFromLocation(dropLocation, CONST_1.default.RESERVATION_TYPE.CAR),
            },
            type: CONST_1.default.RESERVATION_TYPE.CAR,
            confirmations: confirmations,
            vendor: pnrData.carInfo.vendor.name,
            carInfo: { name: pnrData.carInfo.carSpec.displayName, engine: pnrData.carInfo.carSpec.engineType },
            cancellationPolicy: (_e = (_d = pnrData.cancellationPolicy) === null || _d === void 0 ? void 0 : _d.policy) !== null && _e !== void 0 ? _e : null,
            cancellationDeadline: (_g = (_f = pnrData.cancellationPolicy) === null || _f === void 0 ? void 0 : _f.deadline.iso8601) !== null && _g !== void 0 ? _g : null,
            duration: 0,
            travelerPersonalInfo: {
                name: getTravelerName(traveler),
                email: (_h = traveler === null || traveler === void 0 ? void 0 : traveler.email) !== null && _h !== void 0 ? _h : '',
            },
        },
    });
    return reservationList;
}
function getRailReservations(pnr, travelers) {
    var reservationList = [];
    if (!pnr.data.railPnr) {
        return [];
    }
    var pnrData = pnr.data.railPnr;
    pnrData.tickets.forEach(function (ticket) {
        ticket.legs.forEach(function (legIdx, legIndex) {
            var _a, _b, _c, _d, _e, _f;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            var leg = pnrData.legInfos.at(legIdx);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            var travelerIdx = ticket.passengerRefs.at(legIndex);
            var travelerInfo = pnrData.passengerInfos.at(travelerIdx);
            var traveler = findTravelerInfo(travelers, travelerInfo === null || travelerInfo === void 0 ? void 0 : travelerInfo.userOrgId.userId.id);
            reservationList.push({
                reservationIndex: legIndex,
                reservation: {
                    reservationID: pnr.pnrId,
                    start: {
                        date: leg.departAt.iso8601,
                        longName: leg.originInfo.name,
                        shortName: leg.originInfo.code,
                        cityName: leg.originInfo.cityName,
                    },
                    end: {
                        date: leg.arriveAt.iso8601,
                        longName: leg.destinationInfo.name,
                        shortName: leg.destinationInfo.code,
                        cityName: leg.destinationInfo.cityName,
                    },
                    route: {
                        name: "".concat(leg.vehicle.carrierName, " ").concat(leg.vehicle.timetableId),
                        airlineCode: leg.vehicle.carrierName,
                        number: leg.vehicle.timetableId,
                    },
                    duration: parseDurationToSeconds(leg.duration.iso8601),
                    type: CONST_1.default.RESERVATION_TYPE.TRAIN,
                    confirmations: [
                        {
                            name: 'Confirmation Number',
                            value: (_a = leg.ticketNumber) !== null && _a !== void 0 ? _a : '',
                        },
                    ],
                    vendor: leg.vendorName,
                    coachNumber: (_c = (_b = leg.allocatedSpaces) === null || _b === void 0 ? void 0 : _b.at(0)) === null || _c === void 0 ? void 0 : _c.coachNumber,
                    seatNumber: (_e = (_d = leg.allocatedSpaces) === null || _d === void 0 ? void 0 : _d.at(0)) === null || _e === void 0 ? void 0 : _e.seatNumber,
                    travelerPersonalInfo: {
                        name: getTravelerName(traveler),
                        email: (_f = traveler === null || traveler === void 0 ? void 0 : traveler.email) !== null && _f !== void 0 ? _f : '',
                    },
                },
            });
        });
    });
    return reservationList;
}
function getReservationsFromSpotnanaPayload(reportID, tripData) {
    if (!(tripData === null || tripData === void 0 ? void 0 : tripData.pnrs)) {
        return [];
    }
    var reservations = tripData.pnrs
        .flatMap(function (pnr) {
        var _a;
        var travelers = (_a = pnr.data.pnrTravelers) !== null && _a !== void 0 ? _a : [];
        var reservationList = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], getAirReservations(pnr, travelers), true), getHotelReservations(pnr, travelers), true), getCarReservations(pnr, travelers), true), getRailReservations(pnr, travelers), true);
        return reservationList.map(function (reservationData) { return ({
            reservation: reservationData.reservation,
            reportID: reportID,
            transactionID: '0',
            sequenceIndex: 0,
            reservationIndex: reservationData.reservationIndex,
        }); });
    })
        .map(function (reservationData, index) { return (__assign(__assign({}, reservationData), { sequenceIndex: index })); });
    return reservations.sort(function (a, b) { return new Date(a.reservation.start.date).getTime() - new Date(b.reservation.start.date).getTime(); });
}
function getReservationsFromTripReport(tripReport, transactions) {
    var _a;
    if ((_a = tripReport === null || tripReport === void 0 ? void 0 : tripReport.tripData) === null || _a === void 0 ? void 0 : _a.payload) {
        return getReservationsFromSpotnanaPayload(tripReport.reportID, tripReport.tripData.payload);
    }
    if (transactions) {
        return getReservationsFromTripTransactions(transactions);
    }
    return [];
}
function getTripTotal(tripReport) {
    var _a, _b, _c, _d, _e, _f;
    if ((_a = tripReport === null || tripReport === void 0 ? void 0 : tripReport.tripData) === null || _a === void 0 ? void 0 : _a.payload) {
        return {
            totalDisplaySpend: ((_d = (_c = (_b = tripReport.tripData.payload.tripPaymentInfo) === null || _b === void 0 ? void 0 : _b.totalFare) === null || _c === void 0 ? void 0 : _c.amount) !== null && _d !== void 0 ? _d : 0) * 100,
            currency: (_f = (_e = tripReport.tripData.payload.tripPaymentInfo) === null || _e === void 0 ? void 0 : _e.totalFare) === null || _f === void 0 ? void 0 : _f.currencyCode,
        };
    }
    return (0, ReportUtils_1.getMoneyRequestSpendBreakdown)(tripReport);
}
function getReservationDetailsFromSequence(tripReservations, sequenceIndex) {
    var reservationDataIndex = tripReservations === null || tripReservations === void 0 ? void 0 : tripReservations.findIndex(function (reservation) { return reservation.sequenceIndex === sequenceIndex; });
    var reservationData = tripReservations.at(reservationDataIndex);
    var prevReservationData = Number(reservationData === null || reservationData === void 0 ? void 0 : reservationData.reservationIndex) > 0 ? tripReservations === null || tripReservations === void 0 ? void 0 : tripReservations.at(reservationDataIndex - 1) : undefined;
    var reservation = reservationData === null || reservationData === void 0 ? void 0 : reservationData.reservation;
    var prevReservation = prevReservationData === null || prevReservationData === void 0 ? void 0 : prevReservationData.reservation;
    var reservationType = reservation === null || reservation === void 0 ? void 0 : reservation.type;
    var reservationIcon = getTripReservationIcon(reservation === null || reservation === void 0 ? void 0 : reservation.type);
    return {
        reservation: reservation,
        prevReservation: prevReservation,
        reservationType: reservationType,
        reservationIcon: reservationIcon,
    };
}
