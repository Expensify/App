import useMapMarkers from '@hooks/useMapMarkers';
import type {MapMarkerType} from '@hooks/useMapMarkers/types';

type MapMarkerIconProps = {
    markerType: MapMarkerType;
};

function MapMarkerIcon({markerType}: MapMarkerIconProps) {
    const getMapMarkerIconComponent = useMapMarkers();
    return getMapMarkerIconComponent(markerType);
}

export default MapMarkerIcon;
