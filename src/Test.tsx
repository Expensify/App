import React, {useState} from 'react';
// eslint-disable-next-line no-restricted-imports
import {Text} from 'react-native';

export default function Test() {
    const [count, setCount] = useState(0);
    return (
        <>
            <Text style={{color: 'black'}}>{count}</Text>
            <Text
                style={{color: 'black'}}
                onPress={() => setCount(count + 1)}
            >
                no siema
            </Text>
        </>
    );
}
