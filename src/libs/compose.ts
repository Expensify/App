/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable import/export */

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
 */
export default function compose(): <R>(a: R) => R;

export default function compose<F extends Function>(f: F): F;

/* two functions */
export default function compose<A extends unknown[], R1, R2>(f1: (...args: A) => R1, f2: (a: R1) => R2): (...args: A) => R2;

/* three functions */
export default function compose<A extends unknown[], R1, R2, R3>(f1: (...args: A) => R1, f2: (a: R1) => R2, f3: (a: R2) => R3): (...args: A) => R3;

/* four functions */
export default function compose<A extends unknown[], R1, R2, R3, R4>(f1: (...args: A) => R1, f2: (a: R1) => R2, f3: (a: R2) => R3, f4: (a: R3) => R4): (...args: A) => R4;

/* five functions */
export default function compose<A extends unknown[], R1, R2, R3, R4, R5>(
    f1: (...args: A) => R1,
    f2: (a: R1) => R2,
    f3: (a: R2) => R3,
    f4: (a: R3) => R4,
    f5: (a: R4) => R5,
): (...args: A) => R5;

/* six functions */
export default function compose<A extends unknown[], R1, R2, R3, R4, R5, R6>(
    f1: (...args: A) => R1,
    f2: (a: R1) => R2,
    f3: (a: R2) => R3,
    f4: (a: R3) => R4,
    f5: (a: R4) => R5,
    f6: (a: R5) => R6,
): (...args: A) => R6;

/* rest */
export default function compose<R>(f1: (a: unknown) => R, ...funcs: Function[]): (...args: unknown[]) => R;

export default function compose(...funcs: Function[]): Function {
    if (funcs.length === 0) {
        // infer the argument type so it is usable in inference down the line
        return <T>(arg: T) => arg;
    }

    if (funcs.length === 1) {
        return funcs[0] ?? (<T>(arg: T) => arg);
    }

    return funcs.reduce(
        (a, b) =>
            (...args: unknown[]) =>
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                a(b(...args)),
    );
}
