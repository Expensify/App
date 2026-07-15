import type {DirectionsProps} from './MapViewTypes';

import AlternateDirections from './AlternateDirections';
import Direction from './Direction';
import DistanceSymbol from './DistanceSymbol';
import utils from './utils';

function Directions({directionCoordinates, alternativeDirection, setIsAlternativeDirectionSelected, distanceInMeters, unit, waypoints}: DirectionsProps) {
    if (!directionCoordinates) {
        return null;
    }

    const alternativeDirectionCoordinates = alternativeDirection?.coordinates;
    const hasAlternativeDirection = !!alternativeDirection && !!alternativeDirectionCoordinates?.length;
    const isAlternativeDirectionSelected = !!alternativeDirection?.isSelected;

    return (
        <>
            {hasAlternativeDirection ? (
                <>
                    <AlternateDirections
                        directionCoordinates={directionCoordinates}
                        alternativeDirection={alternativeDirection}
                        setIsAlternativeDirectionSelected={setIsAlternativeDirectionSelected}
                    />
                    <DistanceSymbol
                        distanceInMeters={alternativeDirection.distanceInMeters}
                        unit={unit}
                        directionCoordinates={utils.isSingleSegmentRoute(alternativeDirectionCoordinates) ? alternativeDirectionCoordinates : alternativeDirectionCoordinates.flat()}
                        waypoints={waypoints}
                        isSelected={isAlternativeDirectionSelected}
                    />
                </>
            ) : (
                <Direction coordinates={directionCoordinates} />
            )}
            <DistanceSymbol
                distanceInMeters={distanceInMeters}
                unit={unit}
                directionCoordinates={utils.isSingleSegmentRoute(directionCoordinates) ? directionCoordinates : directionCoordinates.flat()}
                waypoints={waypoints}
                isSelected={!isAlternativeDirectionSelected}
            />
        </>
    );
}

export default Directions;
