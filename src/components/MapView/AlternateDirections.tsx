import useThemeStyles from '@hooks/useThemeStyles';

import Mapbox from '@rnmapbox/maps';

import type {AlternateDirectionsProps} from './MapViewTypes';

import {getAlternateDirectionsShape, SELECTED_BORDER_ID, SELECTED_FILL_ID, SOURCE_ID, UNSELECTED_BORDER_ID, UNSELECTED_FILL_ID} from './alternateDirectionsUtils';

function AlternateDirections({directionCoordinates, alternateDirection, setIsAlternateDirectionSelected}: AlternateDirectionsProps) {
    const styles = useThemeStyles();
    const directionShape = getAlternateDirectionsShape(directionCoordinates, alternateDirection);

    return (
        <Mapbox.ShapeSource
            id={SOURCE_ID}
            shape={directionShape}
            onPress={({features}) => {
                const properties = features.at(0)?.properties;
                if (typeof properties?.isAlternate !== 'boolean') {
                    return;
                }
                setIsAlternateDirectionSelected?.(properties.isAlternate);
            }}
        >
            <Mapbox.LineLayer
                id={UNSELECTED_FILL_ID}
                filter={['==', ['get', 'isSelected'], false]}
                style={styles.alternativeMapDirection}
            />
            <Mapbox.LineLayer
                id={UNSELECTED_BORDER_ID}
                belowLayerID={UNSELECTED_FILL_ID}
                filter={['==', ['get', 'isSelected'], false]}
                style={styles.mapDirectionBorder}
            />
            <Mapbox.LineLayer
                id={SELECTED_FILL_ID}
                filter={['==', ['get', 'isSelected'], true]}
                style={styles.mapDirection}
            />
            <Mapbox.LineLayer
                id={SELECTED_BORDER_ID}
                belowLayerID={SELECTED_FILL_ID}
                filter={['==', ['get', 'isSelected'], true]}
                style={styles.mapDirectionBorder}
            />
        </Mapbox.ShapeSource>
    );
}

export default AlternateDirections;
