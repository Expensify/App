import {Text} from 'react-native';
import React, {useState} from 'react';

const propTypes = {};
const defaultProps = {};

function DummyComponentWithStateHook() {
    const [state] = useState('');
    return <Text>{state}</Text>;
}

DummyComponentWithStateHook.propTypes = propTypes;
DummyComponentWithStateHook.defaultProps = defaultProps;
DummyComponentWithStateHook.displayName = 'DummyComponentWithStateHook';

export default DummyComponentWithStateHook;
