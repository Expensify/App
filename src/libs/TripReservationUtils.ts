import type {ArrayValues} from 'type-fest';
import * as Expensicons from '@src/components/Icon/Expensicons';
import CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';
import type {Reservation, ReservationType} from '@src/types/onyx/Transaction';
import type Transaction from '@src/types/onyx/Transaction';
import type {AirPnr, CarPnr, HotelPnr, Pnr, PnrData, PnrTraveler, RailPnr, TripData} from '@src/types/onyx/TripData';
import type IconAsset from '@src/types/utils/IconAsset';
import {getMoneyRequestSpendBreakdown} from './ReportUtils';

function getTripReservationIcon(reservationType?: ReservationType): IconAsset {
    switch (reservationType) {
        case CONST.RESERVATION_TYPE.FLIGHT:
            return Expensicons.Plane;
        case CONST.RESERVATION_TYPE.HOTEL:
            return Expensicons.Bed;
        case CONST.RESERVATION_TYPE.CAR:
            return Expensicons.CarWithKey;
        case CONST.RESERVATION_TYPE.TRAIN:
            return Expensicons.Train;
        default:
            return Expensicons.Luggage;
    }
}

type ReservationData = {reservation: Reservation; transactionID: string; reportID: string | undefined; reservationIndex: number; sequenceIndex: number};

function getReservationsFromTripTransactions(transactions: Transaction[]): ReservationData[] {
    return transactions
        .flatMap(
            (item) =>
                item?.receipt?.reservationList?.map((reservation, reservationIndex) => ({
                    reservation,
                    transactionID: item.transactionID,
                    reportID: item.reportID,
                    reservationIndex,
                    sequenceIndex: reservationIndex,
                })) ?? [],
        )
        .sort((a, b) => new Date(a.reservation.start.date).getTime() - new Date(b.reservation.start.date).getTime());
}

function getTripEReceiptIcon(transaction?: Transaction): IconAsset | undefined {
    const reservationType = transaction ? transaction.receipt?.reservationList?.[0]?.type : '';

    switch (reservationType) {
        case CONST.RESERVATION_TYPE.FLIGHT:
        case CONST.RESERVATION_TYPE.CAR:
            return Expensicons.Plane;
        case CONST.RESERVATION_TYPE.HOTEL:
            return Expensicons.Bed;
        default:
            return undefined;
    }
}

/**
 * Extracts the confirmation code from a reservation
 */
function getTripReservationCode(reservation: Reservation): string {
    return `${reservation.confirmations && reservation.confirmations?.length > 0 ? `${reservation.confirmations.at(0)?.value} • ` : ''}`;
}

function parseDurationToSeconds(duration: string): number {
    const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
    const matches = duration.match(regex);
    if (!matches) {
        return 0;
    }
    const hours = parseInt(matches[1] || '0', 10);
    const minutes = parseInt(matches[2] || '0', 10);
    const seconds = parseInt(matches[3] || '0', 10);
    return hours * 3600 + minutes * 60 + seconds;
}

function getSeatByLegAndFlight(travelerInfo: ArrayValues<AirPnr['travelerInfos']>, legIdx: number, flightIdx: number): string | undefined {
    const seats = travelerInfo.booking?.seats?.filter((seat) => seat.legIdx === legIdx && seat.flightIdx === flightIdx);
    if (seats && seats.length > 0) {
        return seats.join(', ');
    }
    return '';
}
function getTravelerName(traveler: ArrayValues<PnrData['pnrTravelers']>['personalInfo'] | undefined): string {
    if (!traveler?.name) {
        return '';
    }
    let name = traveler.name.family1;

    if (traveler.name.family2) {
        name += ` ${traveler.name.family2}`;
    }
    if (traveler.name.middle) {
        name += ` ${traveler.name.middle}`;
    }
    if (traveler.name.given) {
        name += ` ${traveler.name.given}`;
    }

    return name.trim();
}

function getAddressFromLocation(
    location: {addressLines?: string[]; postalCode?: string; locality?: string; administrativeArea?: string; regionCode?: string},
    type?: ReservationType,
): string {
    let address = '';
    if (location.addressLines) {
        address += location.addressLines.join(', ');
    }

    if (type === CONST.RESERVATION_TYPE.CAR) {
        return address.trim();
    }

    if (location.postalCode) {
        address += ` ${location.postalCode}`;
    }
    if (location.locality) {
        address += `, ${location.locality}`;
    }
    if (location.administrativeArea) {
        address += `, ${location.administrativeArea}`;
    }
    if (location.regionCode) {
        address += `, ${location.regionCode}`;
    }

    return address.trim();
}

function findTravelerInfo(travelers: PnrTraveler[], userId: string | undefined) {
    return travelers.find((travelerData) => travelerData.userId.id === userId)?.personalInfo;
}

function getAirReservations(pnr: Pnr, travelers: PnrTraveler[]): Array<{reservationIndex: number; reservation: Reservation}> {
    const reservationList: Array<{reservationIndex: number; reservation: Reservation}> = [];

    if (!pnr.data.airPnr) {
        return [];
    }

    const pnrData: AirPnr = pnr.data.airPnr;
    const airlineInfo = pnr.data.additionalMetadata?.airlineInfo ?? [];
    const airports = pnr.data.additionalMetadata?.airportInfo ?? [];

    pnrData.travelerInfos.forEach((travelerInfo) => {
        travelerInfo.tickets.forEach((ticket) => {
            const flightCoupons = ticket.flightCoupons;
            flightCoupons.forEach((flightDetails, index) => {
                const legIdx = flightDetails.legIdx;
                const flightIdx = flightDetails.flightIdx;
                const flightObject = pnrData.legs?.at(legIdx)?.flights.at(flightIdx);

                const airlineCode = flightObject?.marketing.airlineCode;
                const longAirlineName = airlineInfo.find((info) => info.airlineCode === airlineCode)?.airlineName ?? airlineCode;

                const company = {
                    shortName: airlineCode ?? '',
                    phone: '',
                    longName: longAirlineName ?? '',
                };

                const origin = flightObject?.origin;
                const originAirport = airports.find((airport) => airport.airportCode === origin);
                const start = {
                    date: flightObject?.departureDateTime?.iso8601 ?? '',
                    timezoneOffset: '',
                    shortName: origin,
                    longName: originAirport?.airportName ?? origin,
                    cityName: `${originAirport?.cityName}, ${originAirport?.stateCode}, ${originAirport?.countryName}`,
                };

                const dest = flightObject?.destination;
                const destAirport = airports.find((airport) => airport.airportCode === dest);
                const end = {
                    date: flightObject?.arrivalDateTime?.iso8601 ?? '',
                    timezoneOffset: '',
                    shortName: dest,
                    longName: destAirport?.airportName ?? dest,
                    cityName: `${destAirport?.cityName}, ${destAirport?.stateCode}, ${destAirport?.countryName}`,
                };

                const route = {
                    number: flightObject?.marketing.num ?? '',
                    airlineCode: `${flightObject?.marketing.airlineCode}${flightObject?.marketing.num}`,
                    class: flightObject?.cabin,
                };

                const confirmations = [
                    {
                        name: 'Confirmation Number',
                        value: flightObject?.vendorConfirmationNumber ?? '',
                    },
                ];
                const traveler = findTravelerInfo(travelers, travelerInfo.userId.id);
                const reservationObject: Reservation = {
                    company,
                    start,
                    end,
                    route,
                    confirmations,
                    arrivalGate: flightObject?.arrivalGate,
                    seatNumber: getSeatByLegAndFlight(travelerInfo, legIdx, flightIdx),
                    type: CONST.RESERVATION_TYPE.FLIGHT,
                    duration: parseDurationToSeconds(flightObject?.duration.iso8601 ?? ''),
                    reservationID: pnr.pnrId,
                    travelerPersonalInfo: {
                        name: getTravelerName(traveler),
                        email: traveler?.email ?? '',
                    },
                };

                reservationList.push({reservation: reservationObject, reservationIndex: index});
            });
        });
    });

    return reservationList;
}

function getHotelReservations(pnr: Pnr, travelers: PnrTraveler[]): Array<{reservationIndex: number; reservation: Reservation}> {
    const reservationList: Array<{reservationIndex: number; reservation: Reservation}> = [];

    if (!pnr.data.hotelPnr) {
        return [];
    }

    const pnrData: HotelPnr = pnr.data.hotelPnr;

    const confirmations = [
        {
            name: 'Confirmation Number',
            value: pnrData.vendorConfirmationNumber,
        },
    ];
    const travelerInfo = pnrData.travelerInfos.at(0);
    const traveler = findTravelerInfo(travelers, travelerInfo?.userId.id);

    reservationList.push({
        reservationIndex: 0,
        reservation: {
            reservationID: pnr.pnrId,
            start: {
                date: pnrData.checkInDateTime?.iso8601,
                address: getAddressFromLocation(pnrData.hotelInfo.address),
                longName: pnrData.hotelInfo.name,
                shortName: pnrData.hotelInfo.chainCode,
                cityName: pnrData.hotelInfo.chainName,
            },
            end: {
                date: pnrData.checkOutDateTime?.iso8601,
                address: getAddressFromLocation(pnrData.hotelInfo.address),
                longName: pnrData.hotelInfo.name,
                shortName: pnrData.hotelInfo.chainCode,
                cityName: pnrData.hotelInfo.chainName,
            },
            type: CONST.RESERVATION_TYPE.HOTEL,
            company: {longName: pnrData.hotelInfo.chainName},
            duration: 0,
            numberOfRooms: pnrData.numberOfRooms,
            roomClass: pnrData.room.roomName,
            cancellationPolicy: pnrData.room.cancellationPolicy?.policy ?? null,
            cancellationDeadline: pnrData.room.cancellationPolicy?.deadline?.iso8601 ?? null,
            confirmations,
            travelerPersonalInfo: {
                name: getTravelerName(traveler),
                email: traveler?.email ?? '',
            },
        },
    });

    return reservationList;
}

function getCarReservations(pnr: Pnr, travelers: PnrTraveler[]): Array<{reservationIndex: number; reservation: Reservation}> {
    const reservationList: Array<{reservationIndex: number; reservation: Reservation}> = [];

    if (!pnr.data.carPnr) {
        return [];
    }

    const pnrData: CarPnr = pnr.data.carPnr;

    const confirmations = [
        {
            name: 'Confirmation Number',
            value: pnrData.vendorConfirmationNumber,
        },
    ];
    const traveler = travelers.at(0)?.personalInfo;
    const pickupLocation = pnrData.carInfo.pickupLocation.address;
    const dropLocation = pnrData.carInfo.dropOffLocation.address;

    reservationList.push({
        reservationIndex: 0,
        reservation: {
            reservationID: pnr.pnrId,
            start: {
                date: pnrData.pickupDateTime?.iso8601,
                location: getAddressFromLocation(pickupLocation, CONST.RESERVATION_TYPE.CAR),
            },
            end: {
                date: pnrData.dropOffDateTime?.iso8601,
                location: getAddressFromLocation(dropLocation, CONST.RESERVATION_TYPE.CAR),
            },
            type: CONST.RESERVATION_TYPE.CAR,
            confirmations,
            vendor: pnrData.carInfo.vendor.name,
            carInfo: {name: pnrData.carInfo.carSpec.displayName, engine: pnrData.carInfo.carSpec.engineType},
            cancellationPolicy: pnrData.cancellationPolicy?.policy ?? null,
            cancellationDeadline: pnrData.cancellationPolicy?.deadline.iso8601 ?? null,
            duration: 0,
            travelerPersonalInfo: {
                name: getTravelerName(traveler),
                email: traveler?.email ?? '',
            },
        },
    });

    return reservationList;
}

function getRailReservations(pnr: Pnr, travelers: PnrTraveler[]): Array<{reservationIndex: number; reservation: Reservation}> {
    const reservationList: Array<{reservationIndex: number; reservation: Reservation}> = [];

    if (!pnr.data.railPnr) {
        return [];
    }
    const pnrData: RailPnr = pnr.data.railPnr;

    pnrData.tickets.forEach((ticket) => {
        ticket.legs.forEach((legIdx, legIndex) => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const leg = pnrData.legInfos.at(legIdx)!;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const travelerIdx = ticket.passengerRefs.at(legIndex)!;
            const travelerInfo = pnrData.passengerInfos.at(travelerIdx);

            const traveler = findTravelerInfo(travelers, travelerInfo?.userOrgId.userId.id);

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
                        name: `${leg.vehicle.carrierName} ${leg.vehicle.timetableId}`,
                        airlineCode: leg.vehicle.carrierName,
                        number: leg.vehicle.timetableId,
                    },
                    duration: parseDurationToSeconds(leg.duration.iso8601),
                    type: CONST.RESERVATION_TYPE.TRAIN,
                    confirmations: [
                        {
                            name: 'Confirmation Number',
                            value: leg.ticketNumber ?? '',
                        },
                    ],
                    vendor: leg.vendorName,
                    coachNumber: leg.allocatedSpaces?.at(0)?.coachNumber,
                    seatNumber: leg.allocatedSpaces?.at(0)?.seatNumber,
                    travelerPersonalInfo: {
                        name: getTravelerName(traveler),
                        email: traveler?.email ?? '',
                    },
                },
            });
        });
    });

    return reservationList;
}

function getReservationsFromSpotnanaPayload(reportID: string, tripData?: TripData): ReservationData[] {
    if (!tripData?.pnrs) {
        return [];
    }

    const reservations: ReservationData[] = tripData.pnrs
        .flatMap((pnr) => {
            const travelers = pnr.data.pnrTravelers ?? [];

            const reservationList: Array<{reservationIndex: number; reservation: Reservation}> = [
                ...getAirReservations(pnr, travelers),
                ...getHotelReservations(pnr, travelers),
                ...getCarReservations(pnr, travelers),
                ...getRailReservations(pnr, travelers),
            ];

            return reservationList.map((reservationData) => ({
                reservation: reservationData.reservation,
                reportID,
                transactionID: '0',
                sequenceIndex: 0,
                reservationIndex: reservationData.reservationIndex,
            }));
        })
        .map((reservationData, index) => ({...reservationData, sequenceIndex: index}));

    return reservations.sort((a, b) => new Date(a.reservation.start.date).getTime() - new Date(b.reservation.start.date).getTime());
}

function getReservationsFromTripReport(tripReport?: Report, transactions?: Transaction[]): ReservationData[] {
    if (tripReport?.tripData?.payload) {
        return getReservationsFromSpotnanaPayload(tripReport.reportID, tripReport.tripData.payload);
    }
    if (transactions) {
        return getReservationsFromTripTransactions(transactions);
    }
    return [];
}

function getTripTotal(tripReport: Report): {
    totalDisplaySpend: number;
    currency?: string;
} {
    if (tripReport?.tripData?.payload) {
        return {
            totalDisplaySpend: (tripReport.tripData.payload.tripPaymentInfo?.totalFare?.amount ?? 0) * 100,
            currency: tripReport.tripData.payload.tripPaymentInfo?.totalFare?.currencyCode,
        };
    }

    return getMoneyRequestSpendBreakdown(tripReport);
}

function getReservationDetailsFromSequence(tripReservations: ReservationData[], sequenceIndex: number) {
    const reservationDataIndex = tripReservations?.findIndex((reservation) => reservation.sequenceIndex === sequenceIndex);
    const reservationData = tripReservations.at(reservationDataIndex);
    const prevReservationData = Number(reservationData?.reservationIndex) > 0 ? tripReservations?.at(reservationDataIndex - 1) : undefined;
    const reservation = reservationData?.reservation;
    const prevReservation = prevReservationData?.reservation;
    const reservationType = reservation?.type;
    const reservationIcon = getTripReservationIcon(reservation?.type);
    return {
        reservation,
        prevReservation,
        reservationType,
        reservationIcon,
    };
}

export {getTripReservationIcon, getTripEReceiptIcon, getTripReservationCode, getReservationsFromTripReport, getTripTotal, getReservationDetailsFromSequence};
export type {ReservationData};
