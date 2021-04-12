import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import {compose} from 'underscore';
import ONYXKEYS from '../../../ONYXKEYS';
import styles from '../../../styles/styles';
import themeColors from '../../../styles/themes/default';
import BigNumberPad from '../../../components/BigNumberPad';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import TextInputFocusable from '../../../components/TextInputFocusable';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';

const propTypes = {
    // Callback to inform parent modal of success
    onStepComplete: PropTypes.func.isRequired,

    // Callback to inform parent modal with key pressed
    numberPressed: PropTypes.func.isRequired,

    // User's currency preference
    selectedCurrency: PropTypes.objectOf(PropTypes.shape({
        currencyCode: PropTypes.string,
        currencySymbol: PropTypes.string,
    })).isRequired,

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

class IOUAmountPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            textInputWidth: 0,
        };
    }

    componentDidMount() {
        if (this.textInput) {
            this.textInput.focus();
        }
    }

    /**
     * Returns the sections needed for the OptionsSelector
     *
     * @param {Boolean} maxParticipantsReached
     * @returns {Array}
     */
    getSections() {
        const sections = [];
        sections.push({
            title: undefined,
            data: this.props.participants,
            shouldShow: true,
            indexOffset: 0,
        });

        return sections;
    }

    render() {
        return (
            <View style={[styles.flex1, styles.pageWrapper]}>
                {this.props.iou.loading && <ActivityIndicator color={themeColors.text} />}
                <View style={[
                    styles.flex1,
                    styles.flexRow,
                    styles.w100,
                    styles.alignItemsCenter,
                    styles.justifyContentCenter,
                ]}
                >
                    <TouchableOpacity onPress={() => Navigation.navigate(ROUTES.IOU_CURRENCY)}>
                        <Text style={styles.iouAmountText}>
                            {this.props.selectedCurrency.currencySymbol}
                        </Text>
                    </TouchableOpacity>
                    {this.props.isSmallScreenWidth
                        ? <Text style={styles.iouAmountText}>{this.props.amount}</Text>
                        : (
                            <View>
                                <TextInputFocusable
                                        style={[styles.iouAmountTextInput,
                                            {width: Math.max(5, this.state.textInputWidth)}]}
                                        onKeyPress={(event) => {
                                            this.props.numberPressed(event.key);
                                            event.preventDefault();
                                        }}
                                        ref={el => this.textInput = el}
                                        defaultValue={this.props.amount}
                                        textAlign="left"
                                />
                                <Text
                                    style={[styles.iouAmountText, styles.invisible, styles.pushTextRight]}
                                    onLayout={e => this.setState({textInputWidth: e.nativeEvent.layout.width})}
                                >
                                    {this.props.amount}
                                </Text>
                            </View>
                        )}
                </View>
                <View style={[styles.w100, styles.justifyContentEnd]}>
                    {this.props.isSmallScreenWidth
                        ? <BigNumberPad numberPressed={this.props.numberPressed} />
                        : <View />}
                    <TouchableOpacity
                            style={[styles.button, styles.w100, styles.mt5, styles.buttonSuccess,
                                this.props.isNextButtonDisabled ? styles.buttonSuccessDisabled : {}]}
                            onPress={this.props.onStepComplete}
                            disabled={this.props.isNextButtonDisabled}
                    >
                        <Text style={[styles.buttonText, styles.buttonSuccessText]}>
                            Next
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}
IOUAmountPage.displayName = 'IOUAmountPage';
IOUAmountPage.propTypes = propTypes;
IOUAmountPage.defaultProps = defaultProps;

export default compose(
    withWindowDimensions,
    withOnyx({
        iou: {key: ONYXKEYS.IOU},
    }),
)(IOUAmountPage);
