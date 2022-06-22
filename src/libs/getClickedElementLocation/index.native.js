import {StatusBar} from 'react-native';

/**
 * Returns the position of the clicked element
 *
 * @param {Object} ref
 * @returns {Promise}
 */
function getClickedElementLocation(ref) {
    return new Promise((resolve) => {
        ref.measureInWindow((x, y, width, height) => resolve({
            // When statusbar is translucent, y coordinates does not include topEdgeOffset
            bottom: y + height + StatusBar.currentHeight,
            left: x,
        }));
    });
}

export default getClickedElementLocation;
