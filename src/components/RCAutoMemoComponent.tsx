import {useCallback, useMemo} from 'react';
import {Pressable} from 'react-native';

function RCAutoMemoComponent() {
    const someValue = useMemo(() => {
        return 'someValue';
    }, []);

    const someCallback = useCallback(() => {
        return 'someValue';
    }, []);

    // eslint-disable-next-line react-native-a11y/has-valid-accessibility-descriptors
    return <Pressable onPress={someCallback}>{someValue}</Pressable>;
}

export default RCAutoMemoComponent;
