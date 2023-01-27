import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import _ from 'underscore/underscore-node.mjs';
import styles from '../../styles/styles';
import Recent from '../../../assets/images/history.svg';
import Smiley from '../../../assets/images/emoji.svg';
import AnimalsAndNature from '../../../assets/images/emojiCategoryIcons/plant.svg';
import FoodAndDrink from '../../../assets/images/emojiCategoryIcons/hamburger.svg';
import TravelAndPlaces from '../../../assets/images/emojiCategoryIcons/plane.svg';
import Activities from '../../../assets/images/emojiCategoryIcons/soccer-ball.svg';
import Objects from '../../../assets/images/emojiCategoryIcons/light-bulb.svg';
import Symbols from '../../../assets/images/emojiCategoryIcons/peace-sign.svg';
import Flags from '../../../assets/images/emojiCategoryIcons/flag.svg';
import CategoryShortcutButton from './CategoryShortcutButton';

const propTypes = {
    /** The function to call when an emoji is selected */
    onPress: PropTypes.func.isRequired,

    /** The indices that the icons should link to */
    headerIndices: PropTypes.arrayOf(PropTypes.number).isRequired,
};

const CategoryShortcutBar = (props) => {
    const icons = [Recent, Smiley, AnimalsAndNature, FoodAndDrink, TravelAndPlaces, Activities, Objects, Symbols, Flags];

    return (
        <View style={[styles.pv2, styles.ph4, styles.flexRow]}>
            {_.map(props.headerIndices, (headerIndex, i) => (
                <CategoryShortcutButton
                    icon={icons[i]}
                    onPress={() => props.onPress(headerIndex)}
                    key={`categoryShortcut${i}`}
                />
            ))}
        </View>
    );
};
CategoryShortcutBar.propTypes = propTypes;
CategoryShortcutBar.displayName = 'CategoryShortcutBar';

export default CategoryShortcutBar;
