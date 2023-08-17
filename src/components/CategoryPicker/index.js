import React from 'react';
import _ from 'underscore';
import {View, Text} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import {propTypes, defaultProps} from './categoryPickerPropTypes';

function CategoryPicker({policyCategories}) {
    if (policyCategories === null) {
        return null;
    }

    return (
        <View>
            {_.chain(policyCategories)
                .values()
                .map((category) => (
                    <View key={category.name}>
                        <Text>{category.name}</Text>
                    </View>
                ))
                .value()}
        </View>
    );
}

CategoryPicker.displayName = 'CategoryPicker';
CategoryPicker.propTypes = propTypes;
CategoryPicker.defaultProps = defaultProps;

export default withOnyx({
    policyCategories: {
        key: ({policyID}) => `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`,
    },
})(CategoryPicker);
