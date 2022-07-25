/**
 * Avatar icon flickers when message is sent for the first time, return and set the source as
 * defaultSource prop of image to prevent avatar icon from flicker when running on Web/Desktop
 * @param {String|Function} source The source of avatar image
 * @return {Object} The image source
 */
export default source => ({uri: source});
