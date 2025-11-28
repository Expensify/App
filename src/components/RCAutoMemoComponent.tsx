import {useMemo} from 'react';

function RCAutoMemoComponent() {
    const someValue = useMemo(() => {
        return 'someValue';
    }, []);

    return <div>{someValue}</div>;
}

export default RCAutoMemoComponent;
