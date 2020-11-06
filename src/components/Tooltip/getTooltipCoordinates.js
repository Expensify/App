import {Dimensions} from 'react-native';

/**
 * ~Tooltip coordinate system:~
 * The tooltip coordinates are based on the element which it is wrapping.
 * We take the x and y coordinates of the element and divide the surroundings
 * in four quadrants, and check for the one with biggest area.
 * Once we know the quadrant with the biggest area, we can place the tooltip in that
 * direction.
 *
 * To find the areas we first get 5 coordinate points: the center and the 4 extreme points.
 * Once we know the coordinates, we can get the length of the sides which form each quadrant.
 *
 * @param {number} componentWidth
 * @param {number} componentHeight
 * @param {number} xOffset The distance between the left side of the screen and the left side of the component.
 * @param {number} yOffset The distance between the top of the screen and the top of the component.
 *
 * @returns {object}
 */
export default function (componentWidth, componentHeight, xOffset, yOffset) {
    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;

    const centerX = xOffset + (componentWidth / 2);
    const centerY = yOffset + (componentHeight / 2);

    // Determine which cartesian quadrant our component's center is in
    if (centerX < (windowWidth / 2)) {
        if (centerY < (windowHeight / 2)) {
            // Q2
            return [centerX - (componentWidth / 2), centerY + (componentHeight / 2)];
        }

        // Q3
        return [centerX - (componentWidth / 2), centerY - (componentHeight / 2)];
    }

    if (centerY < (windowHeight / 2)) {
        // Q1
        return [centerX + (componentWidth / 2), centerY + (componentHeight / 2)];
    }

    // Q4
    return [centerX + (componentWidth / 2), centerY - (componentHeight / 2)];
}
