import type {DirectionsProps} from './MapViewTypes';

import Direction from './Direction';
import DistanceSymbol from './DistanceSymbol';
import utils from './utils';

type MainDirectionProps = Pick<DirectionsProps, 'directionCoordinates' | 'setIsAlternativeDirectionSelected' | 'distanceInMeters' | 'unit' | 'waypoints'> & {
    isAlternativeDirectionSelected: boolean;
};

function MainDirection({directionCoordinates, setIsAlternativeDirectionSelected, distanceInMeters, isAlternativeDirectionSelected, unit, waypoints}: MainDirectionProps) {
    if (!directionCoordinates) {
        return null;
    }

    return (
        <>
            <Direction
                coordinates={directionCoordinates}
                isSelected={!isAlternativeDirectionSelected}
                id="main"
                onPress={() => setIsAlternativeDirectionSelected?.(false)}
            />
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

type AlternativeDirectionProps = Pick<DirectionsProps, 'alternativeDirection' | 'setIsAlternativeDirectionSelected' | 'unit' | 'waypoints'>;

function AlternativeDirection({alternativeDirection, setIsAlternativeDirectionSelected, unit, waypoints}: AlternativeDirectionProps) {
    const alternativeDirectionCoordinates = alternativeDirection?.coordinates;

    if (!alternativeDirection || !alternativeDirectionCoordinates?.length) {
        return null;
    }

    return (
        <>
            <Direction
                coordinates={alternativeDirectionCoordinates}
                isSelected={alternativeDirection.isSelected}
                id="alternative"
                onPress={() => setIsAlternativeDirectionSelected?.(true)}
            />
            <DistanceSymbol
                distanceInMeters={alternativeDirection.distanceInMeters}
                unit={unit}
                directionCoordinates={utils.isSingleSegmentRoute(alternativeDirectionCoordinates) ? alternativeDirectionCoordinates : alternativeDirectionCoordinates.flat()}
                waypoints={waypoints}
                isSelected={alternativeDirection.isSelected}
            />
        </>
    );
}

function Directions({directionCoordinates, alternativeDirection, setIsAlternativeDirectionSelected, distanceInMeters, unit, waypoints}: DirectionsProps) {
    if (!directionCoordinates) {
        return null;
    }

    return (
        <>
            <MainDirection
                directionCoordinates={directionCoordinates}
                setIsAlternativeDirectionSelected={setIsAlternativeDirectionSelected}
                distanceInMeters={distanceInMeters}
                isAlternativeDirectionSelected={!!alternativeDirection?.isSelected}
                unit={unit}
                waypoints={waypoints}
            />
            <AlternativeDirection
                alternativeDirection={alternativeDirection}
                setIsAlternativeDirectionSelected={setIsAlternativeDirectionSelected}
                unit={unit}
                waypoints={waypoints}
            />
        </>
    );
}

export default Directions;
