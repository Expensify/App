import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import styles from '../../styles/styles';
import Recent from '../../../assets/images/history.svg';
import Smiley from '../../../assets/images/emoji.svg';


const CategoryShortcutBar = () => {

    return (
        <View style={[styles.pt2, styles.ph4, styles.flexRow]}>
            <Text>test</Text>
        </View>
    );
};
CategoryShortcutBar.displayName = 'CategoryShortcutBar';

export default CategoryShortcutBar;
