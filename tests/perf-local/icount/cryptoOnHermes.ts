/** Stand-in for Node's `crypto.randomInt`, which some perf-local tests use for test data; uses the seeded Math.random. */
function randomInt(min: number, max?: number): number {
    const [low, high] = max === undefined ? [0, min] : [min, max];
    return low + Math.floor(Math.random() * (high - low));
}

export {randomInt};
export default {randomInt};
