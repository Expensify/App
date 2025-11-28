import {useCallback, useMemo} from 'react';
import {Pressable} from 'react-native';

function RCAutoMemoComponent() {
    const someValue = useMemo(() => {
        return 'someValue';
    }, []);

    const someCallback = useCallback(() => {
        return 'someValue';
    }, []);

    return <Pressable onPress={someCallback}>{someValue}</Pressable>;
}

export default RCAutoMemoComponent;
