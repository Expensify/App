import useMapMarkers from '@hooks/useMapMarkers';
import type {MapMarkerType} from '@hooks/useMapMarkers/types';

type MapMarkerIconProps = {
    /** The type of the map marker to display */
    markerType: MapMarkerType;
};

function MapMarkerIcon({markerType}: MapMarkerIconProps) {
    const getMapMarkerIconComponent = useMapMarkers();
    return getMapMarkerIconComponent(markerType);
}

export default MapMarkerIcon;
