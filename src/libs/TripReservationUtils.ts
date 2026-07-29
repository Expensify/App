import CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';
import type {Reservation, ReservationTimeDetails, ReservationType} from '@src/types/onyx/Transaction';
import type Transaction from '@src/types/onyx/Transaction';
import type {AirPnr, CarPnr, HotelPnr, Pnr, PnrData, PnrTraveler, RailPnr, TripData} from '@src/types/onyx/TripData';
import type IconAsset from '@src/types/utils/IconAsset';

import type {ArrayValues} from 'type-fest';

import {format, subSeconds} from 'date-fns';
import {fromZonedTime, toZonedTime} from 'date-fns-tz';
import {SafeString} from 'expensify-common';

import {getMoneyRequestSpendBreakdown} from './ReportUtils';

type TripReservationIcons = Record<'Plane' | 'PlaneCircleSlash' | 'Bed' | 'BedCircleSlash' | 'CarWithKey' | 'CarCircleSlash' | 'Train' | 'TrainCircleSlash' | 'Luggage', IconAsset>;

function getTripReservationIcon(icons: TripReservationIcons, reservationType?: ReservationType, isCancelled?: boolean): IconAsset {
    switch (reservationType) {
        case CONST.RESERVATION_TYPE.FLIGHT:
            return isCancelled ? icons.PlaneCircleSlash : icons.Plane;
        case CONST.RESERVATION_TYPE.HOTEL:
            return isCancelled ? icons.BedCircleSlash : icons.Bed;
        case CONST.RESERVATION_TYPE.CAR:
            return isCancelled ? icons.CarCircleSlash : icons.CarWithKey;
        case CONST.RESERVATION_TYPE.TRAIN:
            return isCancelled ? icons.TrainCircleSlash : icons.Train;
        default:
            return icons.Luggage;
    }
}

type ReservationItem = {reservationIndex: number; reservation: Reservation; isCancelled?: boolean};
type ReservationData = {reservation: Reservation; transactionID: string; reportID: string | undefined; reservationIndex: number; sequenceIndex: number; isCancelled?: boolean};
type ReservationPNRData = {
    pnrID: string;
    totalFareAmount: number;
    currency: string;
    reservations: ReservationData[];
};

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

function getTripEReceiptIcon(icons: Record<'Plane' | 'Bed', IconAsset>, transaction?: Transaction): IconAsset | undefined {
    const reservationType = transaction ? transaction.receipt?.reservationList?.[0]?.type : '';

    switch (reservationType) {
        case CONST.RESERVATION_TYPE.FLIGHT:
        case CONST.RESERVATION_TYPE.CAR:
            return icons.Plane;
        case CONST.RESERVATION_TYPE.HOTEL:
            return icons.Bed;
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
    const regex = /P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?/;
    const matches = duration.match(regex);
    if (!matches) {
        return 0;
    }
    const days = parseInt(matches[1] || '0', 10);
    const hours = parseInt(matches[2] || '0', 10);
    const minutes = parseInt(matches[3] || '0', 10);
    const seconds = parseInt(matches[4] || '0', 10);
    return days * 86400 + hours * 3600 + minutes * 60 + seconds;
}

function getSeatByLegAndFlight(travelerInfo: ArrayValues<AirPnr['travelerInfos']>, legIdx: number, flightIdx: number): string | undefined {
    const seats = travelerInfo.booking?.seats?.filter((seat) => seat.legIdx === legIdx && seat.flightIdx === flightIdx);
    if (seats && seats.length > 0) {
        return seats.map((seat) => SafeString(seat.number)).join(', ');
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

    return name?.trim();
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

function getAirReservations(pnr: Pnr, travelers: PnrTraveler[]): ReservationItem[] {
    const reservationList: ReservationItem[] = [];

    if (!pnr.data.airPnr) {
        return [];
    }

    const pnrData: AirPnr = pnr.data.airPnr;
    const airlineInfo = pnr.data.additionalMetadata?.airlineInfo ?? [];
    const airports = pnr.data.additionalMetadata?.airportInfo ?? [];

    for (const travelerInfo of pnrData.travelerInfos) {
        const ticketSource = travelerInfo.tickets.some((t) => t.flightCoupons.length > 0) ? travelerInfo.tickets : (travelerInfo.lastConfirmedTickets ?? travelerInfo.tickets);
        for (const ticket of ticketSource) {
            const flightCoupons = ticket.flightCoupons;
            for (const [index, flightDetails] of flightCoupons.sort((a, b) => a.legIdx - b.legIdx).entries()) {
                const legIdx = flightDetails.legIdx;
                const flightIdx = flightDetails.flightIdx;
                const leg = pnrData.legs?.at(legIdx);
                const flightObject = leg?.flights.at(flightIdx);

                const isFlightCancelled = leg?.legStatus === CONST.LEG_STATUS.CANCELLED || isCancelledPnrStatus(flightObject?.flightStatus ?? '');

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
                    legId: legIdx,
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

                reservationList.push({reservation: reservationObject, reservationIndex: index, isCancelled: isFlightCancelled || undefined});
            }
        }
    }

    return reservationList;
}

function getCancellationDeadline(pnrData: HotelPnr): string | undefined {
    const deadlineUtc = pnrData.room.cancellationPolicy?.deadlineUtc?.iso8601;
    const duration = pnrData.room.cancellationPolicy?.durationBeforeArrivalDeadline?.iso8601;
    const checkIn = pnrData.checkInDateTime?.iso8601;
    if (deadlineUtc && duration && checkIn) {
        // 1. Extract the target UTC offset from deadlineUtc (e.g. "-04:00")
        const match = deadlineUtc.match(/(Z|[+-]\d{2}:\d{2})$/);
        if (!match) {
            return pnrData.room.cancellationPolicy?.deadlineUtc?.iso8601;
        }
        const utcOffset = match[1] === 'Z' ? '+00:00' : match[1];

        // 2. Convert the check-in wall-clock time to an absolute UTC instant,
        //    treating it as being expressed in the target offset timezone.
        const checkInUtc = fromZonedTime(checkIn, utcOffset);

        // 3. Subtract the duration in UTC-space (preserves wall-clock intent for
        //    day/hour units; DST transitions are irrelevant for fixed offsets).
        const deadlineUtcInstant = subSeconds(checkInUtc, parseDurationToSeconds(duration));

        // 4. Convert back to the target offset's wall-clock representation.
        const deadlineZoned = toZonedTime(deadlineUtcInstant, utcOffset);

        // 5. Format as ISO-8601 with the explicit offset suffix.
        //    `format` with "yyyy-MM-dd'T'HH:mm:ss" gives the bare local datetime;
        //    we then append the offset so the result is a proper fixed-offset string.
        const localPart = format(deadlineZoned, "yyyy-MM-dd'T'HH:mm:ss");
        return `${localPart}${utcOffset}`;
    }
    return pnrData.room.cancellationPolicy?.deadlineUtc?.iso8601;
}

function getHotelReservations(pnr: Pnr, travelers: PnrTraveler[]): ReservationItem[] {
    const reservationList: ReservationItem[] = [];

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
                cityName: pnrData.hotelInfo.address.locality,
            },
            end: {
                date: pnrData.checkOutDateTime?.iso8601,
                address: getAddressFromLocation(pnrData.hotelInfo.address),
                longName: pnrData.hotelInfo.name,
                shortName: pnrData.hotelInfo.chainCode,
                cityName: pnrData.hotelInfo.address.locality,
            },
            type: CONST.RESERVATION_TYPE.HOTEL,
            company: {longName: pnrData.hotelInfo.chainName},
            duration: 0,
            numberOfRooms: pnrData.numberOfRooms,
            roomClass: pnrData.room.roomName,
            cancellationPolicy: pnrData.room.cancellationPolicy?.policy ?? null,
            cancellationDeadline: getCancellationDeadline(pnrData),
            confirmations,
            travelerPersonalInfo: {
                name: getTravelerName(traveler),
                email: traveler?.email ?? '',
            },
        },
    });

    return reservationList;
}

function getCarReservations(pnr: Pnr, travelers: PnrTraveler[]): ReservationItem[] {
    const reservationList: ReservationItem[] = [];

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
                cityName: pickupLocation.locality,
            },
            end: {
                date: pnrData.dropOffDateTime?.iso8601,
                location: getAddressFromLocation(dropLocation, CONST.RESERVATION_TYPE.CAR),
                cityName: dropLocation.locality,
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

// Drop Trainline URN-style codes so the trip UI doesn't render them as station labels.
const getRailStationShortName = (code: string | undefined) => (code && !code.startsWith('urn:') ? code : '');

function getRailReservations(pnr: Pnr, travelers: PnrTraveler[]): ReservationItem[] {
    const reservationList: ReservationItem[] = [];

    if (!pnr.data.railPnr) {
        return [];
    }
    const pnrData: RailPnr = pnr.data.railPnr;

    for (const ticket of pnrData.tickets) {
        for (const [legIndex, legIdx] of ticket.legs.entries()) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const leg = pnrData.legInfos.at(legIdx)!;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const travelerIdx = ticket.passengerRefs.at(legIndex)!;
            const travelerInfo = pnrData.passengerInfos.at(travelerIdx);

            const traveler = findTravelerInfo(travelers, travelerInfo?.userOrgId.userId.id);

            reservationList.push({
                reservationIndex: legIndex,
                reservation: {
                    legId: legIdx,
                    reservationID: pnr.pnrId,
                    start: {
                        date: leg.departAt.iso8601,
                        longName: leg.originInfo.name,
                        shortName: getRailStationShortName(leg.originInfo.code),
                        cityName: leg.originInfo.cityName,
                    },
                    end: {
                        date: leg.arriveAt.iso8601,
                        longName: leg.destinationInfo.name,
                        shortName: getRailStationShortName(leg.destinationInfo.code),
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
        }
    }

    return reservationList;
}

function isCancelledPnrStatus(status: string): boolean {
    return status === CONST.PNR_STATUS.CANCELLED || status === CONST.PNR_STATUS.CANCELLED_STATUS || status === CONST.PNR_STATUS.VOIDED;
}

function isPnrCancelled(pnr: Pnr): boolean {
    const {data} = pnr;

    if (data.bookingStatus && isCancelledPnrStatus(data.bookingStatus)) {
        return true;
    }

    if (data.hotelPnr) {
        return isCancelledPnrStatus(data.hotelPnr.pnrStatus);
    }
    if (data.carPnr) {
        return isCancelledPnrStatus(data.carPnr.pnrStatus);
    }
    if (data.airPnr) {
        return data.airPnr.legs.length > 0 && data.airPnr.legs.every((leg) => leg.legStatus === CONST.LEG_STATUS.CANCELLED);
    }
    if (data.railPnr) {
        const {outwardJourney, inwardJourney} = data.railPnr;
        const isOutwardCancelled = outwardJourney ? isCancelledPnrStatus(outwardJourney.journeyStatus) : true;
        const isInwardCancelled = inwardJourney ? isCancelledPnrStatus(inwardJourney.journeyStatus) : true;
        return isOutwardCancelled && isInwardCancelled;
    }

    return false;
}

function getReservationsFromSpotnanaPayload(reportID: string, tripData?: TripData): ReservationData[] {
    if (!tripData?.pnrs) {
        return [];
    }

    const reservations: ReservationData[] = tripData.pnrs
        .flatMap((pnr) => {
            const travelers = pnr.data.pnrTravelers ?? [];
            const pnrCancelled = isPnrCancelled(pnr);

            const reservationList: ReservationItem[] = [
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
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- using || intentionally: pnrCancelled is boolean, ?? would not fall through on false
                isCancelled: pnrCancelled || reservationData.isCancelled || undefined,
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

function formatTransitLocationLabel(reservationTimeDetails: ReservationTimeDetails, hideShortCode = false): string {
    const longName = reservationTimeDetails?.longName ?? '';
    const shortName = reservationTimeDetails?.shortName ?? '';
    if (hideShortCode || !shortName) {
        return longName;
    }
    return longName ? `${longName} (${shortName})` : `(${shortName})`;
}

function getPNRReservationDataFromTripReport(tripReport?: Report, transactions?: Transaction[]): ReservationPNRData[] {
    const reservations = getReservationsFromTripReport(tripReport, transactions);
    if (reservations.length === 0) {
        return [];
    }

    const pnrMap = new Map<string, ReservationPNRData>();

    for (const reservation of reservations) {
        // eslint-disable-next-line rulesdir/no-default-id-values
        const pnrID = reservation.reservation.reservationID ?? '';
        if (!pnrMap.has(pnrID)) {
            pnrMap.set(pnrID, {
                pnrID,
                totalFareAmount: 0,
                currency: '',
                reservations: [],
            });
        }
        const reservationData = pnrMap.get(pnrID);
        if (reservationData) {
            reservationData.reservations.push(reservation);
        }
    }

    return Array.from(pnrMap.values()).map((pnrData) => {
        const pnrPayloadData = tripReport?.tripData?.payload?.pnrs?.find((pnr) => pnrData.pnrID === pnr.pnrId);
        return {
            ...pnrData,
            totalFareAmount: ((pnrPayloadData?.data?.totalFareAmount?.base?.amount ?? 0) + (pnrPayloadData?.data?.totalFareAmount?.tax?.amount ?? 0)) * 100,
            currency: pnrPayloadData?.data?.totalFareAmount?.base?.currencyCode ?? '',
        };
    });
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

function getReservationDetailsFromSequence(icons: TripReservationIcons, tripReservations: ReservationData[], sequenceIndex: number) {
    const reservationDataIndex = tripReservations?.findIndex((reservation) => reservation.sequenceIndex === sequenceIndex);
    const reservationData = tripReservations.at(reservationDataIndex);
    const prevReservationData = Number(reservationData?.reservationIndex) > 0 ? tripReservations?.at(reservationDataIndex - 1) : undefined;
    const reservation = reservationData?.reservation;
    const prevReservation = prevReservationData?.reservation;
    const reservationType = reservation?.type;
    const reservationIcon = getTripReservationIcon(icons, reservation?.type, reservationData?.isCancelled);
    return {
        reservation,
        prevReservation,
        reservationType,
        reservationIcon,
        isCancelled: reservationData?.isCancelled,
    };
}

function formatCancelledDescription(cancelledLabel: string, description: string, isCancelled?: boolean): string {
    if (!isCancelled) {
        return description;
    }
    return `${cancelledLabel} ${CONST.DOT_SEPARATOR} ${description}`;
}

export {
    getTripReservationIcon,
    getTripEReceiptIcon,
    getTripReservationCode,
    getReservationsFromTripReport,
    getTripTotal,
    getReservationDetailsFromSequence,
    formatTransitLocationLabel,
    getPNRReservationDataFromTripReport,
    getAirReservations,
    isPnrCancelled,
    formatCancelledDescription,
};
export type {ReservationData};
