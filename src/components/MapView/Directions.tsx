import type {DirectionsProps} from './MapViewTypes';

import AlternateDirections from './AlternateDirections';
import Direction from './Direction';
import DistanceSymbol from './DistanceSymbol';
import utils from './utils';

function Directions({directionCoordinates, alternateDirection, setIsAlternateDirectionSelected, distanceInMeters, unit, waypoints}: DirectionsProps) {
    if (!directionCoordinates) {
        return null;
    }

    const alternateDirectionCoordinates = alternateDirection?.coordinates;
    const hasAlternateDirection = !!alternateDirection && !!alternateDirectionCoordinates?.length;
    const isAlternateDirectionSelected = !!alternateDirection?.isSelected;

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
                        unit={unit}
                        directionCoordinates={utils.convertSegmentedRouteToSingleSegmentRoute(alternateDirectionCoordinates)}
                        waypoints={waypoints}
                        isSelected={isAlternateDirectionSelected}
                    />
                </>
            ) : (
                <Direction coordinates={directionCoordinates} />
            )}
            <DistanceSymbol
                distanceInMeters={distanceInMeters}
                unit={unit}
                directionCoordinates={utils.convertSegmentedRouteToSingleSegmentRoute(directionCoordinates)}
                waypoints={waypoints}
                isSelected={!isAlternateDirectionSelected}
            />
        </>
    );
}

export default Directions;
