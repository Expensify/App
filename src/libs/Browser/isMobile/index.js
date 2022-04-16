/**
 * Allows us to identify whether the platform is mobile.
 *
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent
 *
 * @returns {Boolean}
 */
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Silk|Opera Mini/i.test(navigator.userAgent);
}

export default isMobile;
