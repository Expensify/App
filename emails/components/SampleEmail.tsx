import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import {ExpensifyWordmark} from '@components/Icon/Expensicons';
import Text from '@components/Text';
import variables from '../../src/styles/variables';

const SampleEmail: React.FC = () => {
    return (
        <View style={{alignItems: 'center', padding: 20}}>
            <Icon
                src={ExpensifyWordmark}
                width={variables.modalWordmarkWidth}
                height={variables.modalWordmarkHeight}
            />
            <Text>We're glad to have you on board.</Text>
        </View>
    );
};

export default SampleEmail;
