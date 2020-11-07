import {Dimensions} from 'react-native';

/**
 * ~Tooltip coordinate system:~
 * The tooltip coordinates are based on the element which it is wrapping.
 * If the element is too far to the left or right of the page, then we want the tooltip to
 * be positioned on its right or left (respectively).
 * If the element is on the top half of the page, we'll have the tooltip below it, and if
 * the element is on the bottom half of the page, we'll have the tooltip above it.
 *
 * Currently we're using the value, 10, as a buffer distance from the tooltip to the element. 
 *
 * @param {number} componentWidth
 * @param {number} componentHeight
 * @param {number} xOffset The distance between the left side of the screen and the left side of the component.
 * @param {number} yOffset The distance between the top of the screen and the top of the component.
 *
 * @returns {object} Returns coordinates for the top left corner of the tooltip RELATIVE to the element being hovered.
 */
export default function (componentWidth, componentHeight, xOffset, yOffset) {
    const windowWidth = Dimensions.get('screen').width;
    const windowHeight = Dimensions.get('screen').height;


    const centerX = (componentWidth / 2);
    const centerY = (componentHeight / 2);

    let gutter = '';
    let inBottom = yOffset > (windowHeight / 2);
    let tooltipX = centerX;
    let tooltipY = inBottom ? componentHeight + 15 : 15;

    // Determine if we're in a danger gutter
    // Left Gutter
    if(centerX < 75 ) {
        // letting 10 be the buffer distance between the element and the tooltip
        gutter = 'left';
        tooltipX = componentWidth + 3;
    }
    // Right Gutter
    if (windowWidth - centerX < 75) {
        gutter = 'right';
        tooltipX = - 3;
    }
    
    console.log(`tooltipX: ${tooltipX}, tooltipY: ${tooltipY}, gutter: ${gutter}, inBottom: ${inBottom}`);
    return [tooltipX, tooltipY, gutter, inBottom];
}
