/* eslint-disable rulesdir/no-useless-compose */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import withWindowDimensions, {AvatarWithDisplayName, withInjected, withInjected2} from './test';

/* eslint-disable import/export */
type Func<T extends unknown[], R> = (...a: T) => R;

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
export default function compose<A, T extends unknown[], R>(f1: (a: A) => R, f2: Func<T, A>): Func<T, R>;

/* three functions */
export default function compose<A, B, T extends unknown[], R>(f1: (b: B) => R, f2: (a: A) => B, f3: Func<T, A>): Func<T, R>;

/* four functions */
export default function compose<A, B, C, T extends unknown[], R>(f1: (c: C) => R, f2: (b: B) => C, f3: (a: A) => B, f4: Func<T, A>): Func<T, R>;

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
            (...args: any) =>
                a(b(...args)),
    );
}

const composed = compose(withInjected, withInjected2);

const y = composed(AvatarWithDisplayName);
