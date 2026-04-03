import React, {useEffect, useState} from 'react';
import {Text} from 'react-native';

function DisplayName({first, last}: {first: string; last: string}) {
    const [displayName, setDisplayName] = useState('');
    useEffect(() => {
        setDisplayName(`${first} ${last}`);
    }, [first, last]);
    return <Text>{displayName}</Text>;
}

function TotalDisplay({price, quantity}: {price: number; quantity: number}) {
    const [total, setTotal] = useState(0);
    useEffect(() => {
        setTotal(price * quantity);
    }, [price, quantity]);
    return <Text>{total}</Text>;
}

export {DisplayName, TotalDisplay};
