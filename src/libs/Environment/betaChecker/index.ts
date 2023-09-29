/**
 * There's no beta build in non native
 */
function isBetaBuild(): Promise<boolean> {
    return Promise.resolve(false);
}

export default {
    isBetaBuild,
};
