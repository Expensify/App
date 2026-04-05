/**
 * Mock for sharedTrapStack used in tests.
 * The shared trap stack is used by focus-trap-react to coordinate multiple focus traps.
 * In tests, we use an empty array as there's no actual focus trap coordination needed.
 */
const sharedTrapStack: Element[] = [];

export default sharedTrapStack;
