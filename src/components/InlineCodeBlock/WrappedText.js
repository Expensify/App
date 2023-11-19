import PropTypes from 'prop-types';
<<<<<<< Updated upstream
import React, {Fragment} from 'react';
import {View} from 'react-native';
=======
import React, {Fragment, useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
>>>>>>> Stashed changes
import _ from 'underscore';
import Text from '@components/Text';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';

const propTypes = {
    /** Required text */
    children: PropTypes.string.isRequired,

    /** Style to be applied to Text */
    // eslint-disable-next-line react/forbid-prop-types
    textStyles: PropTypes.arrayOf(PropTypes.object),
};

const defaultProps = {
    textStyles: [],
};

const EmptyText = () => <Text style={{}}> </Text>;

function WrappedText(props) {
    const styles = useThemeStyles();
    if (!_.isString(props.children)) {
        return null;
    }

    const textStyles = {
        ...StyleSheet.flatten(props.textStyles),
        borderWidth: 19,
        borderRadius: 3,
        borderColor: 'red',

        flexDirection: 'row',
        backgroundColor: 'yellow',
        fontSize: 12,
        lineHeight: 60,
        padding: 5,
    };
    const inlineText = _.map(props.children.split(''), (row, idx) => <Text style={stY.textPart} key={idx}>{row}</Text>)
    return (
        <View style={stY.textContainer}>
           {inlineText}
        </View>
    );
}

const stY = StyleSheet.create({
    textContainer: {
        flexDirection: 'column',
        flexWrap: 'wrap',
        backgroundColor: 'green',
        borderWidth: 1,
        borderColor: 'red',
        paddingBottom: 5,
        paddingStart: 5,
        paddingEnd: 5,
        alignSelf: 'flex-start',
        flexGrow: 1,
        flexBasis: 0,
    },
    textPart: {
        color: 'blue',
        backgroundColor: 'yellow'
    }
});
WrappedText.propTypes = propTypes;
WrappedText.defaultProps = defaultProps;
WrappedText.displayName = 'WrappedText';

export default WrappedText;
