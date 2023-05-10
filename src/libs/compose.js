import _ from 'underscore';

/**
 * This is a utility function taken directly from Redux. (We don't want to add Redux as a dependency)
 * It enables functional composition, useful for the chaining/composition of HOCs.
 *
 * For example, instead of:
 *
 * export default hoc1(config1, hoc2(config2, hoc3(config3)))(Component);
 *
 * Use this instead:
 *
 * export default compose(
 *     hoc1(config1),
 *     hoc2(config2),
 *     hoc3(config3),
 * )(Component)
 *
 * @returns {Function}
 */
export default function compose(...funcs) {
    if (funcs.length === 0) {
        return (arg) => arg;
    }

    if (funcs.length === 1) {
        return funcs[0];
    }

    return _.reduce(
        funcs,
        (a, b) =>
            (...args) =>
                a(b(...args)),
    );
}
