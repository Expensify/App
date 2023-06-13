import React from 'react';
import {View} from 'react-native';
import Text from '../Text';

const propTypes = {};

const defaultProps = {};

const SelectionListDefault = () => {
    return (
        <View>
            <Text>SelectionListDefault</Text>
        </View>
    );
};

SelectionListDefault.displayName = 'SelectionListDefault';
SelectionListDefault.defaultProps = defaultProps;
SelectionListDefault.propTypes = propTypes;

export default SelectionListDefault;
