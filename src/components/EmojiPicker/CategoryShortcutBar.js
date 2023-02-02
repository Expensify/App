import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import _ from 'underscore';
import styles from '../../styles/styles';
import FrequentlyUsed from '../../../assets/images/history.svg';
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
    // If the user has frequently used emojis, there will be 9 headers, otherwise there will be 8
    const hasFrequentlyUsedEmojis = props.headerIndices.length === 9;
    const icons = [Smiley, AnimalsAndNature, FoodAndDrink, TravelAndPlaces, Activities, Objects, Symbols, Flags];

    // If the user has a frequently used category, push the icon
    if (hasFrequentlyUsedEmojis) {
        icons.unshift(FrequentlyUsed);
    }

    return (
        <View style={[styles.pt2, styles.ph4, styles.flexRow]}>
            {_.map(props.headerIndices, (headerIndex, i) => (
                <CategoryShortcutButton
                    icon={icons[i]}
                    onPress={() => props.onPress(headerIndex)}
                    key={`categoryShortcut${i}`}
                    widthStyle={hasFrequentlyUsedEmojis ? styles.categoryShortcutButtonWithFrequentlyUsed : styles.categoryShortcutButtonWithoutFrequentlyUsed}
                />
            ))}
        </View>
    );
};
CategoryShortcutBar.propTypes = propTypes;
CategoryShortcutBar.displayName = 'CategoryShortcutBar';

export default CategoryShortcutBar;
