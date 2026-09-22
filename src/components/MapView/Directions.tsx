import type {DirectionsProps} from './MapViewTypes';

import AlternateDirections from './AlternateDirections';
import Direction from './Direction';
import DistanceSymbol from './DistanceSymbol';
import useDistanceUnit from './useDistanceUnit';
import utils from './utils';

function Directions({directionCoordinates, alternateDirection, setIsAlternateDirectionSelected, distanceInMeters, unit, waypoints}: DirectionsProps) {
    // Held here rather than in each DistanceSymbol so that toggling one label switches the unit for every label on the map.
    const {distanceUnit, toggleDistanceUnit} = useDistanceUnit(unit);

    if (!directionCoordinates) {
        return null;
    }

    const alternateDirectionCoordinates = alternateDirection?.coordinates;
    const hasAlternateDirection = !!alternateDirection && !!alternateDirectionCoordinates?.length;
    const isAlternateDirectionSelected = !!alternateDirection?.isSelected;

    const {primary: distanceSymbolCoordinate, alternate: alternateDistanceSymbolCoordinate} = utils.getDistanceSymbolCoordinates(
        waypoints?.map((waypoint) => waypoint.coordinate) ?? [],
        utils.convertSegmentedRouteToSingleSegmentRoute(directionCoordinates),
        utils.convertSegmentedRouteToSingleSegmentRoute(alternateDirectionCoordinates),
    );

    return (
        <>
            {hasAlternateDirection ? (
                <>
                    <AlternateDirections
                        directionCoordinates={directionCoordinates}
                        alternateDirection={alternateDirection}
                        setIsAlternateDirectionSelected={setIsAlternateDirectionSelected}
                    />
                    <DistanceSymbol
                        distanceInMeters={alternateDirection.distanceInMeters}
                        distanceUnit={distanceUnit}
                        toggleDistanceUnit={toggleDistanceUnit}
                        distanceSymbolCoordinate={alternateDistanceSymbolCoordinate}
                        isSelected={isAlternateDirectionSelected}
                        selectDirection={() => setIsAlternateDirectionSelected?.(true)}
                    />
                </>
            ) : (
                <Direction coordinates={directionCoordinates} />
            )}
            <DistanceSymbol
                distanceInMeters={distanceInMeters}
                distanceUnit={distanceUnit}
                toggleDistanceUnit={toggleDistanceUnit}
                distanceSymbolCoordinate={distanceSymbolCoordinate}
                isSelected={!isAlternateDirectionSelected}
                selectDirection={() => setIsAlternateDirectionSelected?.(false)}
            />
        </>
    );
}

export default Directions;
