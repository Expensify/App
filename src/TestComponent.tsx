import {deepEqual} from 'fast-equals';
import React, {useEffect, useState} from 'react';
import {Button, View} from 'react-native';
import Onyx, {useOnyx} from 'react-native-onyx';
import Text from './components/Text';
import ONYXKEYS from './ONYXKEYS';

// const wholeCollectionSelector = (collection: any) => collection;

function ChildrenComponent() {
    const [value] = useOnyx(ONYXKEYS.COLLECTION.TEST, {componentName: 'Child useOnyx'});
    // // const [value] = useOnyx(ONYXKEYS.NVP_APP_REVIEW, {componentName: 'Child useOnyx'});

    useEffect(() => {
        console.log('🟦 [CHILD WITH useONYX] RERENDER VALUE:', JSON.stringify(value, null, 2));
    }, [value]);

    return (
        <View style={{backgroundColor: 'blue', padding: 10}}>
            <Text>Children - with useOnyx</Text>
            <Text>Length: {Object.keys(value ?? {}).length}</Text>
        </View>
    );
}

function ChildrenWithoutOnyx({value}: {value: any}) {
    useEffect(() => {
        console.log('🟩 [CHILD WITH PROPS (NO useONYX)] RERENDER VALUE:', JSON.stringify(value, null, 2));
    }, [value]);

    return (
        <View style={{backgroundColor: 'green', padding: 10}}>
            <Text>Children - with props</Text>
            <Text>Length: {Object.keys(value ?? {}).length}</Text>
        </View>
    );
}

function TestComponent() {
    const [showChildren, setShowChildren] = useState(false);
    const [counter, setCounter] = useState(0);
    const [value] = useOnyx(ONYXKEYS.COLLECTION.TEST, {
        // selector: wholeCollectionSelector,
        componentName: 'Parent useOnyx',
    });
    // const [value] = useOnyx(ONYXKEYS.NVP_APP_REVIEW, {
    //     componentName: 'Parent useOnyx',=
    // });

    const valueRef = React.useRef(value);

    useEffect(() => {
        const isSameRef = valueRef.current === value;
        console.log('🟨 [PARENT] RERENDER VALUE: ', JSON.stringify({value, isSameRef, deepEqual: deepEqual(value, valueRef.current)}, null, 2));
        valueRef.current = value;
    }, [value]);

    const onPress = () => {
        console.log('🟨 [PARENT] TOGGLE CHILDREN', !showChildren);
        setShowChildren(!showChildren);
    };

    const onPressCounter = () => {
        setCounter(counter + 1);
    };

    const onPressAddRandomObjectToCollection = () => {
        console.log('🟨 [PARENT] ADD RANDOM OBJECT TO COLLECTION');
        const id = Math.random().toString(36).substring(2, 15);
        Onyx.set(`${ONYXKEYS.COLLECTION.TEST}${id}`, {
            id,
        });
    };

    // const onPressReplaceOnyxObject = () => {
    //     console.log('🟨 [PARENT] REPLACE ONYX OBJECT');
    //     Onyx.set(`${ONYXKEYS.NVP_APP_REVIEW}`, {
    //         response: 'positive',
    //         lastPrompt: new Date().toISOString(),
    //     });
    // };

    return (
        <View style={{backgroundColor: 'orange', padding: 10, width: 300, gap: 10}}>
            <Text color="black">Parent Text Component</Text>
            <Text color="black">Length: {Object.keys(value ?? {}).length}</Text>
            <Button
                title="RERENDER PARENT"
                onPress={onPressCounter}
            />
            <Button
                title={showChildren ? 'Hide Children with useOnyx' : 'Show Children with useOnyx'}
                onPress={onPress}
            />
            <Button
                title="Add object to collection"
                onPress={onPressAddRandomObjectToCollection}
            />
            {/* <Button
                title="Replace Onyx object (non collection)"
                onPress={onPressReplaceOnyxObject}
            />
            <Text color="black">Onyx object (non collection): {JSON.stringify(value, null, 2)}</Text> */}
            <ChildrenWithoutOnyx value={value} />
            {showChildren && <ChildrenComponent />}
        </View>
    );
}

export default TestComponent;
