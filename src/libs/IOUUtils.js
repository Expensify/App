/**
 * Helper method to generate idempotency key.
 *
 * @returns {String}
 */
function getIdempotencyKey() {
    const randomArray = new Uint32Array(10);
    return crypto.getRandomValues(randomArray)[0];
}

export {
    // eslint-disable-next-line import/prefer-default-export
    getIdempotencyKey,
};
