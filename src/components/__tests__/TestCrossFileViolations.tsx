import React, {useEffect, useState} from 'react';
import {Text} from 'react-native';

function OrderTotal({amount, tax}: {amount: number; tax: number}) {
    const [total, setTotal] = useState(0);
    useEffect(() => {
        setTotal(amount + tax);
    }, [amount, tax]);
    return <Text>{total}</Text>;
}

export {OrderTotal};
