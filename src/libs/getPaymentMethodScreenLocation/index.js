/**
 * We don't need to get the position of the element on native platforms because the popover will be bottom mounted
 *
 * @param {Object} nativeEvent
 * @returns {Object}
 */
function getPaymentMethodScreenLocation(nativeEvent) {
    return nativeEvent.currentTarget.getBoundingClientRect();
}

export default getPaymentMethodScreenLocation;
