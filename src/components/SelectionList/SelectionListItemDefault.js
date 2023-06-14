import React from 'react';
import {View} from 'react-native';
import Text from '../Text';

const propTypes = {};

const defaultProps = {};

const SelectionListItemDefault = () => {
    return (
        <View>
            <Text>SelectionListItemDefault</Text>
        </View>
    );
};

SelectionListItemDefault.displayName = 'SelectionListItemDefault';
SelectionListItemDefault.defaultProps = defaultProps;
SelectionListItemDefault.propTypes = propTypes;

export default SelectionListItemDefault;
