// rh/exhaustive-deps: an effect that reads a prop the dependency list omits. A missing dependency is
// deliberately the violation here, not a "wrap this in useMemo" suggestion: the oxlint copy of this
// rule is wrapped in the React Compiler gate, which drops the suggestions and keeps these.
import {useEffect, useState} from 'react';

export function MissingDependency({id}: {id: number}) {
    const [value, setValue] = useState(0);
    useEffect(() => {
        setValue(id);
    }, []);
    return <div>{value}</div>;
}
