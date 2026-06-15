import Direction from './Direction';
import type {Coordinate, GPSDirectionProps} from './MapViewTypes';
import useAnimatedTrailingDirectionCoordinate from './useAnimatedTrailingDirectionCoordinate';

function GPSDirection({directionCoordinates, isTrackingGPS, lastLocation}: GPSDirectionProps) {
    const animatedTrailingCoordinate = useAnimatedTrailingDirectionCoordinate({
        isEnabled: isTrackingGPS && !!lastLocation,
        targetCoordinate: lastLocation ? [lastLocation.longitude, lastLocation.latitude] : undefined,
        directionCoordinates,
    });

    const getCoordinates = () => {
        if (!isTrackingGPS || !lastLocation || !directionCoordinates || directionCoordinates.length === 0) {
            return directionCoordinates;
        }

        const lastSegment = directionCoordinates.at(-1);
        if (!lastSegment) {
            return directionCoordinates;
        }

        if (lastSegment.length === 0) {
            return directionCoordinates;
        }

        const lastLocationCoordinate: Coordinate = animatedTrailingCoordinate ?? [lastLocation.longitude, lastLocation.latitude];

        const newLastSegment = [...lastSegment.slice(0, lastSegment.length === 1 ? undefined : -1), lastLocationCoordinate];

        const newDirectionCoordinates = [...directionCoordinates.slice(0, directionCoordinates.length - 1), newLastSegment];
        return newDirectionCoordinates;
    };

    return <Direction coordinates={getCoordinates()} />;
}

export default GPSDirection;
