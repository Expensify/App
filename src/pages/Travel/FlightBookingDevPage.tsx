import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import Header from '@components/Header';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextInput from '@components/TextInput';

import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearFlightBooking, getFlightFareRules, searchFlights, searchTravelAirports, startFlightCheckout} from '@libs/actions/Travel';
import Navigation from '@libs/Navigation/Navigation';
import type {TravelNavigatorParamList} from '@libs/Navigation/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {FlightFare, FlightFareRules, FlightSearchLeg, TravelAirport} from '@src/types/onyx/TravelFlightSearch';

import type {StackScreenProps} from '@react-navigation/stack';

import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

type FlightBookingDevPageProps = StackScreenProps<TravelNavigatorParamList, typeof SCREENS.TRAVEL.FLIGHT_BOOKING_DEV>;

function formatCents(cents: number, currency: string) {
    return `${(cents / 100).toFixed(2)} ${currency}`;
}

/**
 * Unstyled dev-only screen for exercising the flight booking API end to end against Spotnana's sandbox before the
 * designs exist. It is never shipped.
 */
function FlightBookingDevPage({route}: FlightBookingDevPageProps) {
    const {policyID} = route.params;
    const styles = useThemeStyles();
    const {isBetaEnabled} = usePermissions();
    const [flightSearch] = useOnyx(ONYXKEYS.RAM_ONLY_TRAVEL_FLIGHT_SEARCH);
    const [flightCheckout] = useOnyx(ONYXKEYS.RAM_ONLY_TRAVEL_FLIGHT_CHECKOUT);

    const [origin, setOrigin] = useState('SFO');
    const [destination, setDestination] = useState('NYC');
    const [departDate, setDepartDate] = useState('2026-12-08');
    const [returnDate, setReturnDate] = useState('2026-12-11');
    const [isNonstop, setIsNonstop] = useState(false);
    const [airportQuery, setAirportQuery] = useState('');
    const [airports, setAirports] = useState<TravelAirport[]>([]);
    const [fareRules, setFareRules] = useState<FlightFareRules[]>([]);
    const [pickedFares, setPickedFares] = useState<FlightFare[]>([]);

    useEffect(() => () => clearFlightBooking(), []);

    // An all-uppercase three-letter code that no airport uses is treated as a city, like NYC or LON
    const toLocation = (code: string) => ({code: code.trim().toUpperCase(), isCity: ['NYC', 'LON', 'CHI', 'WAS', 'PAR', 'TYO'].includes(code.trim().toUpperCase())});
    const legs: FlightSearchLeg[] = [
        {origin: toLocation(origin), destination: toLocation(destination), date: departDate},
        ...(returnDate ? [{origin: toLocation(destination), destination: toLocation(origin), date: returnDate}] : []),
    ];

    const startSearch = () => {
        setPickedFares([]);
        setFareRules([]);
        clearFlightBooking();
        searchFlights(policyID, legs, isNonstop ? {maxStops: 0} : {});
    };

    const pickFare = (fare: FlightFare) => {
        const legIndex = flightSearch?.legIndex ?? 0;
        const searchID = flightSearch?.searchID;
        if (!searchID) {
            return;
        }
        setPickedFares([...pickedFares, fare]);
        if (legIndex + 1 < (flightSearch?.query?.legs.length ?? 1)) {
            searchFlights(policyID, flightSearch?.query?.legs ?? legs, flightSearch?.query?.filters ?? {}, legIndex + 1, searchID, fare.fareID);
            return;
        }
        startFlightCheckout(policyID, searchID, fare.fareID);
    };

    const showFareRules = (fare: FlightFare) => {
        if (!flightSearch?.searchID) {
            return;
        }
        getFlightFareRules(policyID, flightSearch.searchID, fare.fareID).then(setFareRules);
    };

    return (
        <ScreenWrapper testID="FlightBookingDevPage">
            <FullPageNotFoundView shouldShow={!isBetaEnabled(CONST.BETAS.IN_APP_FLIGHT_BOOKING)}>
                <Header>
                    <Header.BackButton onPress={() => Navigation.goBack()} />
                    <Header.Title title="Flight booking (dev)" />
                </Header>
                <ScrollView contentContainerStyle={[styles.ph5, styles.pb5]}>
                    <Text style={[styles.textStrong, styles.mv3]}>Airport lookup</Text>
                    <TextInput
                        label="Airport or city"
                        accessibilityLabel="Airport or city"
                        value={airportQuery}
                        onChangeText={setAirportQuery}
                    />
                    <Button
                        style={styles.mv2}
                        onPress={() => searchTravelAirports(policyID, airportQuery).then(setAirports)}
                        accessibilityLabel="Find airports"
                    >
                        <Button.Text>Find airports</Button.Text>
                    </Button>
                    {airports.map((airport) => (
                        <Text key={airport.code}>{`${airport.code} (city ${airport.cityCode}) ${airport.name}, ${airport.cityName}`}</Text>
                    ))}

                    <Text style={[styles.textStrong, styles.mv3]}>Search</Text>
                    <TextInput
                        label="From (airport or city code)"
                        accessibilityLabel="From"
                        value={origin}
                        onChangeText={setOrigin}
                    />
                    <TextInput
                        label="To (airport or city code)"
                        accessibilityLabel="To"
                        value={destination}
                        onChangeText={setDestination}
                    />
                    <TextInput
                        label="Depart (YYYY-MM-DD)"
                        accessibilityLabel="Depart"
                        value={departDate}
                        onChangeText={setDepartDate}
                    />
                    <TextInput
                        label="Return (YYYY-MM-DD, empty for one way)"
                        accessibilityLabel="Return"
                        value={returnDate}
                        onChangeText={setReturnDate}
                    />
                    <Button
                        style={styles.mv2}
                        onPress={() => setIsNonstop(!isNonstop)}
                        accessibilityLabel={isNonstop ? 'Nonstop only: on' : 'Nonstop only: off'}
                    >
                        <Button.Text>{isNonstop ? 'Nonstop only: on' : 'Nonstop only: off'}</Button.Text>
                    </Button>
                    <Button
                        variant={CONST.BUTTON_VARIANT.SUCCESS}
                        style={styles.mv2}
                        isLoading={!!flightSearch?.isLoading}
                        onPress={startSearch}
                        accessibilityLabel="Search"
                    >
                        <Button.Text>Search</Button.Text>
                    </Button>
                    {Object.values(flightSearch?.errors ?? {}).map((error) => (
                        <Text key={String(error)}>{String(error)}</Text>
                    ))}

                    {pickedFares.map((fare, index) => (
                        <Text key={fare.fareID}>{`Leg ${index + 1} picked: ${fare.fareName} ${fare.cabin} ${formatCents(fare.total, fare.currency)}`}</Text>
                    ))}

                    {!flightCheckout && !flightSearch?.itineraries && !!flightSearch?.scheduleItineraries && (
                        <>
                            <Text style={[styles.textStrong, styles.mv3]}>{`Leg ${(flightSearch.legIndex ?? 0) + 1}: ${flightSearch.scheduleItineraries.length} flights, pricing…`}</Text>
                            {flightSearch.scheduleItineraries.map((itinerary) => (
                                <Text
                                    key={itinerary.itineraryID}
                                    style={styles.mb2}
                                >
                                    {itinerary.flights
                                        .map(
                                            (flight) =>
                                                `${flight.flightNumber} ${flight.origin.code} ${flight.departureTime.slice(11, 16)} → ${flight.destination.code} ${flight.arrivalTime.slice(11, 16)}`,
                                        )
                                        .join(' | ')}
                                </Text>
                            ))}
                        </>
                    )}

                    {!flightCheckout && !!flightSearch?.itineraries && (
                        <>
                            <Text style={[styles.textStrong, styles.mv3]}>{`Leg ${(flightSearch.legIndex ?? 0) + 1} results: ${flightSearch.itineraries.length} flights`}</Text>
                            {flightSearch.itineraries.map((itinerary) => (
                                <View
                                    key={itinerary.itineraryID}
                                    style={[styles.mb3, styles.borderBottom, styles.pb2]}
                                >
                                    <Text>
                                        {itinerary.flights
                                            .map(
                                                (flight) =>
                                                    `${flight.flightNumber} ${flight.origin.code} ${flight.departureTime.slice(11, 16)} → ${flight.destination.code} ${flight.arrivalTime.slice(11, 16)}`,
                                            )
                                            .join(' | ')}
                                    </Text>
                                    {(itinerary.fares ?? []).map((fare) => (
                                        <View
                                            key={fare.fareID}
                                            style={[styles.flexRow, styles.alignItemsCenter, styles.mt1]}
                                        >
                                            <Button
                                                size={CONST.BUTTON_SIZE.SMALL}
                                                onPress={() => pickFare(fare)}
                                                accessibilityLabel={`${fare.fareName} ${fare.cabin} ${formatCents(fare.total, fare.currency)}${fare.policyViolations.length ? ' (out of policy)' : ''}${fare.isSeparateTicket ? ' (separate tickets)' : ''}`}
                                            >
                                                <Button.Text>{`${fare.fareName} ${fare.cabin} ${formatCents(fare.total, fare.currency)}${fare.policyViolations.length ? ' (out of policy)' : ''}${fare.isSeparateTicket ? ' (separate tickets)' : ''}`}</Button.Text>
                                            </Button>
                                            <Button
                                                size={CONST.BUTTON_SIZE.SMALL}
                                                style={styles.ml2}
                                                onPress={() => showFareRules(fare)}
                                                accessibilityLabel="Rules"
                                            >
                                                <Button.Text>Rules</Button.Text>
                                            </Button>
                                        </View>
                                    ))}
                                </View>
                            ))}
                        </>
                    )}

                    {fareRules.map((legRules) => (
                        <View
                            key={`${legRules.origin}-${legRules.destination}`}
                            style={styles.mb3}
                        >
                            <Text style={styles.textStrong}>{`Fare rules ${legRules.origin} → ${legRules.destination}`}</Text>
                            {legRules.rules.map((rule) => (
                                <Text key={`${rule.fareBasisCode}-${rule.title}`}>{`${rule.title}: ${rule.text}`}</Text>
                            ))}
                        </View>
                    ))}

                    {!!flightCheckout && (
                        <>
                            <Text style={[styles.textStrong, styles.mv3]}>Checkout</Text>
                            {!!flightCheckout.isLoading && <Text>Loading checkout…</Text>}
                            {Object.values(flightCheckout.errors ?? {}).map((error) => (
                                <Text key={String(error)}>{String(error)}</Text>
                            ))}
                            {flightCheckout.itinerary?.legs.map((leg, index) => (
                                <Text key={leg.flights.at(0)?.flightID ?? index}>
                                    {`Leg ${index + 1}: ${leg.flights.map((flight) => flight.flightNumber).join(', ')}, ${leg.fareName} ${leg.cabin}. Refund: ${leg.rules.refund}. Change: ${leg.rules.change}`}
                                </Text>
                            ))}
                            {!!flightCheckout.priceSummary && (
                                <Text>
                                    {`Flight ${formatCents(flightCheckout.priceSummary.flight, flightCheckout.priceSummary.currency)}, taxes ${formatCents(flightCheckout.priceSummary.taxes, flightCheckout.priceSummary.currency)}, total ${formatCents(flightCheckout.priceSummary.total, flightCheckout.priceSummary.currency)}`}
                                </Text>
                            )}
                            <Text>{`Required traveler fields: ${(flightCheckout.requiredTravelerFields ?? []).join(', ') || 'none'}`}</Text>
                            <Text>{`Out of policy rules: ${flightCheckout.itinerary?.policyViolations.length ?? 0}. Separate tickets: ${flightCheckout.itinerary?.isSeparateTicket ? 'yes' : 'no'}`}</Text>
                            {(flightCheckout.seatMaps ?? []).map((seatMap, index) => (
                                <Text key={seatMap.seatMapID ?? index}>
                                    {`Seat map ${index + 1}: ${(seatMap.cabins ?? [])
                                        .map((cabin) => {
                                            const seats = cabin.rows.flatMap((row) => row.seats);
                                            return `${cabin.cabin} rows ${cabin.rows.at(0)?.row}-${cabin.rows.at(-1)?.row}, ${seats.filter((seat) => seat.isAvailable).length}/${seats.length} open, ${seats.filter((seat) => seat.price > 0).length} paid`;
                                        })
                                        .join('; ')}`}
                                </Text>
                            ))}
                            <Text>
                                {`Cards: ${(flightCheckout.paymentSources ?? []).map((card) => `${card.network} ${card.lastFour} (${card.name})`).join(', ') || 'none on this traveler'}`}
                            </Text>
                        </>
                    )}
                </ScrollView>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default FlightBookingDevPage;
