import type TabRootScrollViewMarkerProps from './types';

/** On web the JS tab bar has no scroll to top on a second tap, so there is nothing to mark. */
function TabRootScrollViewMarker({children}: TabRootScrollViewMarkerProps) {
    return children;
}

/** Lists keep their default scroll component. */
const renderTabRootScrollComponent = undefined;

export default TabRootScrollViewMarker;
export {renderTabRootScrollComponent};
