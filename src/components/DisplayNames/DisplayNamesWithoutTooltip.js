import PropTypes from 'prop-types';
import React from 'react';
import Text from '@components/Text';
import useThemeStyles from '@styles/useThemeStyles';

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
    const styles = useThemeStyles();
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
