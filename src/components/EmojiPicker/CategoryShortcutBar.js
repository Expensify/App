import React from 'react';
import PropTypes from 'prop-types';
import {View, Text} from 'react-native';
import _ from 'underscore/underscore-node.mjs';
import styles from '../../styles/styles';
import Recent from '../../../assets/images/history.svg';
import Smiley from '../../../assets/images/emoji.svg';
import CategoryShortcutButton from './CategoryShortcutButton';

const propTypes = {
    /** The function to call when an emoji is selected */
    onPress: PropTypes.func.isRequired,

    /** The indices that the icons should link to */
    headerIndices: PropTypes.arrayOf(PropTypes.number).isRequired,
};

const CategoryShortcutBar = (props) => {
    const icons = [Recent, Smiley];

    return (
        <View style={[styles.pt2, styles.ph4, styles.flexRow]}>
            <Text>test</Text>
        </View>
    );
};
CategoryShortcutBar.propTypes = propTypes;
CategoryShortcutBar.displayName = 'CategoryShortcutBar';

export default CategoryShortcutBar;
