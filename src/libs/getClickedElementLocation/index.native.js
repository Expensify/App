/**
 * We don't need to get the position of the element on native platforms because the popover will be bottom mounted
 *
 * @returns {Object}
 */
function getClickedElementLocation(nativeEvent) {
    return {
        bottom: nativeEvent.nativeEvent.pageY -  nativeEvent.nativeEvent.locationY,
        left:  nativeEvent.nativeEvent.pageX - nativeEvent.nativeEvent.locationX,
    };
}

export default getClickedElementLocation;
