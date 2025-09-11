import React from 'react';
import {View, Text} from 'react-native';

type FakeTestComponentProps = {
    testProp?: string;
    itemCount?: number;
};

function FakeTestComponent({testProp = 'default', itemCount = 10}: FakeTestComponentProps) {
    const items = Array.from({length: itemCount}, (_, index) => (
        <Text key={index}>
            {testProp} - Item {index + 1}
        </Text>
    ));
    console.log('FakeTestComponent');

    return (
        <View testID="fake-test-component">
            <Text>Fake Test Component for Performance Testing</Text>
            {items}
        </View>
    );
}

FakeTestComponent.displayName = 'FakeTestComponent';

export default FakeTestComponent;
