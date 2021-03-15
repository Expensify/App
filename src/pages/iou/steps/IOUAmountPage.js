import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../../../ONYXKEYS';
import styles from '../../../styles/styles';
import themeColors from '../../../styles/themes/default';
import BigNumberPad from '../../../components/BigNumberPad';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';

const propTypes = {
    // Callback to inform parent modal of success
    onStepComplete: PropTypes.func.isRequired,

    // Callback to inform parent modal with key pressed
    numberPressed: PropTypes.func.isRequired,

    // Currency selection will be implemented later
    // eslint-disable-next-line react/no-unused-prop-types
    currencySelected: PropTypes.func.isRequired,

    // User's currency preference
    selectedCurrency: PropTypes.string.isRequired,

    // Amount value entered by user
    amount: PropTypes.string.isRequired,

    // To disable/enable Next button based on amount validity
    isNextButtonDisabled: PropTypes.bool.isRequired,

    /* Window Dimensions Props */
    ...windowDimensionsPropTypes,

    /* Onyx Props */

    // Holds data related to IOU view state, rather than the underlying IOU data.
    iou: PropTypes.shape({

        // Whether or not the IOU step is loading (retrieving users preferred currency)
        loading: PropTypes.bool,
    }),
};

const defaultProps = {
    iou: {},
};

const IOUAmountPage = props => (
    <View style={[styles.flex1, styles.pageWrapper]}>
        {props.iou.loading && <ActivityIndicator color={themeColors.text} />}
        <View style={[styles.flex1, styles.flexRow, styles.w100, styles.alignItemsCenter, styles.justifyContentCenter]}>
            <Text style={[styles.iouAmountText, styles.flex1, {textAlign: 'right'}]}>{props.selectedCurrency}</Text>
            {props.isSmallScreenWidth
                ? <Text style={[styles.iouAmountText, styles.flex1]}>{props.amount}</Text>
                : (
                    <View style={styles.flex1}>
                        <TextInput
                            style={styles.iouAmountTextInput}
                            onKeyPress={event => props.numberPressed(event.key)}
                            value={props.amount}
                            textAlign="left"
                            autoFocus
                        />
                    </View>
                )}
        </View>
        <View style={[styles.w100, styles.justifyContentEnd]}>
            {props.isSmallScreenWidth
                ? <BigNumberPad numberPressed={props.numberPressed} />
                : <View />}
            <TouchableOpacity
                    style={[styles.button, styles.w100, styles.mt5, styles.buttonSuccess,
                        props.isNextButtonDisabled ? styles.buttonSuccessDisabled : {}]}
                    onPress={props.onStepComplete}
                    disabled={props.isNextButtonDisabled}
            >
                <Text
                    style={[styles.buttonText, styles.buttonSuccessText]}
                >
                    Next
                </Text>
            </TouchableOpacity>
        </View>
    </View>
);

IOUAmountPage.displayName = 'IOUAmountPage';
IOUAmountPage.propTypes = propTypes;
IOUAmountPage.defaultProps = defaultProps;

export default withWindowDimensions(withOnyx({
    iou: {key: ONYXKEYS.IOU},
})(IOUAmountPage));
