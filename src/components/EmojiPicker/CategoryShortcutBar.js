import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import _ from 'underscore/underscore-node.mjs';
import styles from '../../styles/styles';
import Smiley from '../../../assets/images/emoji.svg';
import AnimalsAndNature from '../../../assets/images/emojiCategoryIcons/plant.svg';
import FoodAndDrink from '../../../assets/images/emojiCategoryIcons/hamburger.svg';
import TravelAndPlaces from '../../../assets/images/emojiCategoryIcons/plane.svg';
import Activities from '../../../assets/images/emojiCategoryIcons/soccer-ball.svg';
import Objects from '../../../assets/images/emojiCategoryIcons/light-bulb.svg';
import Symbols from '../../../assets/images/emojiCategoryIcons/peace-sign.svg';
import Flags from '../../../assets/images/emojiCategoryIcons/flag.svg';
import Recent from '../../../assets/images/history.svg';
import CategoryShortcutButton from './CategoryShortcutButton';

const propTypes = {
    /** The function to call when an emoji is selected */
    onPress: PropTypes.func.isRequired,

    /** The indices that the icons should link to */
    headerIndices: PropTypes.arrayOf(PropTypes.number).isRequired,

    /** Handles what to do when we hover over this item with our cursor */
    onHoverIn: PropTypes.func,

    /** Handles what to do when the hover is out */
    onHoverOut: PropTypes.func,
};

const CategoryShortcutBar = (props) => {
    const icons = [Recent, Smiley, AnimalsAndNature, FoodAndDrink, TravelAndPlaces, Activities, Objects, Symbols, Flags];

    return (
        <View style={[styles.pt4, styles.ph4, styles.pb1, styles.alignItemsStart, styles.flexRow]}>
            {_.map(props.headerIndices, (headerIndex, i) => (
                <CategoryShortcutButton
                    emoji={icons[i]}
                    onPress={() => props.onPress(headerIndex)}
                    onHoverIn={props.onHoverIn}
                    onHoverOut={props.onHoverOut}
                    key={`categoryShortcut${i}`}
                />
            ))}
        </View>
    );
};
CategoryShortcutBar.propTypes = propTypes;
CategoryShortcutBar.displayName = 'CategoryShortcutBar';
CategoryShortcutBar.defaultProps = {
    onHoverIn: () => {},
    onHoverOut: () => {},
};

export default CategoryShortcutBar;
