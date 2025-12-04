import {memo, useCallback, useMemo} from 'react';
import {View} from 'react-native';

function RCAutoMemoComponent() {
    const someValue = useMemo(() => {
        return 'someValue';
    }, []);

    const someOtherValue = useMemo(() => {
        return 'someValue';
    }, []);

    const someCallback = useCallback(() => {
        return 'someValue';
    }, []);

    // eslint-disable-next-line react-native-a11y/has-valid-accessibility-descriptors
    return (
        <View onLayout={someCallback}>
            {someValue} {someOtherValue}
        </View>
    );
}

export default memo(RCAutoMemoComponent);
