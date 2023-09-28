import PropTypes from 'prop-types';
import React from 'react';
import styles from '../../styles/styles';
import Text from '../Text';

const propTypes = {
    /** The full title of the DisplayNames component (not split up) */
    fullTitle: PropTypes.string,

    /** Arbitrary styles of the displayName text */
    // eslint-disable-next-line react/forbid-prop-types
    textStyles: PropTypes.arrayOf(PropTypes.object),

    /** Number of lines before wrapping */
    numberOfLines: PropTypes.number,
};

const defaultProps = {
    fullTitle: '',
    textStyles: [],
    numberOfLines: 1,
};

function DisplayNamesWithoutTooltip({textStyles, numberOfLines, fullTitle}) {
    return (
        <Text
            style={[...textStyles, numberOfLines === 1 ? styles.pre : styles.preWrap]}
            numberOfLines={numberOfLines}
        >
            {fullTitle}
        </Text>
    );
}

DisplayNamesWithoutTooltip.propTypes = propTypes;
DisplayNamesWithoutTooltip.defaultProps = defaultProps;
DisplayNamesWithoutTooltip.displayName = 'DisplayNamesWithoutTooltip';

export default DisplayNamesWithoutTooltip;
