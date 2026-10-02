// rh/use-memo: the dependency list has to be an array of simple expressions, and `first + second`
// is not one.
import {useMemo} from 'react';

export function ComputedDependency({first, second}: {first: number; second: number}) {
    const total = useMemo(() => first + second, [first + second]);
    return <div>{total}</div>;
}
