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

type Func<T extends unknown[], R> = (...a: T) => R;

export default function compose(): <R>(a: R) => R;

export default function compose<F extends Function>(f: F): F;

/* two functions */
export default function compose<A, R1 extends unknown[], R2>(f1: (args: A) => R1, f2: Func<R1, A>): Func<R1, R2>;

/* three functions */
export default function compose<A, R1, R2 extends unknown[], R3>(f1: (args: A) => R1, f2: (a: R1) => R2, f3: Func<R2, A>): Func<R2, R3>;

/* four functions */
export default function compose<A, R1, R2, R3 extends unknown[], R4>(f1: (args: A) => R1, f2: (a: R1) => R2, f3: (a: R2) => R3, f4: Func<R3, A>): Func<R3, R4>;

/* five functions */
export default function compose<A, R1, R2, R3, R4 extends unknown[], R5>(f1: (args: A) => R1, f2: (a: R1) => R2, f3: (a: R2) => R3, f4: (a: R3) => R4, f5: Func<R4, A>): Func<R4, R5>;

/* six functions */
export default function compose<A, R1, R2, R3, R4, R5 extends unknown[], R6>(
    f1: (args: A) => R1,
    f2: (a: R1) => R2,
    f3: (a: R2) => R3,
    f4: (a: R3) => R4,
    f5: (a: R4) => R5,
    f6: Func<R5, A>,
): Func<R5, R6>;

/* rest */
export default function compose<R>(f1: (a: unknown) => R, ...funcs: Function[]): (...args: unknown[]) => R;

export default function compose<R>(...funcs: Function[]): (...args: unknown[]) => R;

export default function compose(...funcs: Function[]): Function {
    if (funcs.length === 0) {
        // infer the argument type so it is usable in inference down the line
        return <T>(arg: T) => arg;
    }

    if (funcs.length === 1) {
        return funcs[0];
    }

    return funcs.reduce(
        (a, b) =>
            (...args: unknown[]) =>
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                a(b(...args)),
    );
}
