import type {Coordinate, GPSDirectionProps} from './MapViewTypes';

import Direction from './Direction';
import useAnimatedLeadingDirectionCoordinate from './useAnimatedLeadingDirectionCoordinate';

function GPSDirection({directionCoordinates, isTrackingGPS, lastLocation, belowLayerID}: GPSDirectionProps) {
    const animatedLeadingCoordinate = useAnimatedLeadingDirectionCoordinate({
        isEnabled: isTrackingGPS && !!lastLocation && directionCoordinates.flat().length > 0,
        targetCoordinate: lastLocation ? [lastLocation.longitude, lastLocation.latitude] : undefined,
        directionCoordinates,
    });

    const getCoordinates = () => {
        if (!isTrackingGPS || !lastLocation || !directionCoordinates || directionCoordinates.length === 0) {
            return directionCoordinates;
        }

        const lastSegment = directionCoordinates.at(-1);
        if (!lastSegment?.length) {
            return directionCoordinates;
        }

        const lastLocationCoordinate: Coordinate = animatedLeadingCoordinate ?? [lastLocation.longitude, lastLocation.latitude];

        const newLastSegment = [...lastSegment.slice(0, lastSegment.length === 1 ? undefined : -1), lastLocationCoordinate];

        const newDirectionCoordinates = [...directionCoordinates.slice(0, directionCoordinates.length - 1), newLastSegment];
        return newDirectionCoordinates;
    };

    return (
        <Direction
            coordinates={getCoordinates()}
            belowLayerID={belowLayerID}
        />
    );
}

export default GPSDirection;
