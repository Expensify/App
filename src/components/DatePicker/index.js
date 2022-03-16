import React from 'react';
import moment from 'moment';
import TextInput from '../TextInput';
import CONST from '../../CONST';
import {propTypes, defaultProps} from './datepickerPropTypes';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';
import canUseTouchScreen from '../../libs/canUseTouchscreen';
import DateUtils from '../../libs/DateUtils';
import './styles.css';

const datePickerPropTypes = {
    ...propTypes,
    ...windowDimensionsPropTypes,
};

class Datepicker extends React.Component {
    constructor(props) {
        super(props);

        this.setDate = this.setDate.bind(this);
        this.showDatepicker = this.showDatepicker.bind(this);
        const value = DateUtils.getDateAsText(props.value) || DateUtils.getDateAsText(props.defaultValue) || '';
        this.state = {value};
    }

    componentDidMount() {
        // Adds nice native datepicker on web/desktop. Not possible to set this through props
        this.textInput.setAttribute('type', 'date');
        this.textInput.classList.add('expensify-datepicker');
        if (this.props.maximumDate) {
            this.textInput.setAttribute('max', moment(this.props.maximumDate).format(CONST.DATE.MOMENT_FORMAT_STRING));
        }
    }

    componentDidUpdate() {
        const dateValue = DateUtils.getDateAsText(this.props.value);
        if (this.props.value === undefined || this.state.value === dateValue) {
            return;
        }
        // eslint-disable-next-line react/no-did-update-set-state
        this.setState({value: dateValue});
        this.textInput.setNativeProps({text: dateValue});
    }

    /**
     * Trigger the `onChange` handler when the user input has a complete date or is cleared
     * @param {String} text
     */
    setDate(text) {
        if (!text) {
            this.props.onChange(null);
            return;
        }

        const asMoment = moment(text);
        if (asMoment.isValid()) {
            const asDate = asMoment.toDate();
            this.props.onChange(asDate);
        }
    }

    /**
     * Pops the datepicker up when we focus this field. This only works on mWeb
     * On mWeb the user needs to tap on the field again in order to bring the datepicker. But our current styles
     * don't make this very obvious. To avoid confusion we open the datepicker when the user focuses the field
     */
    showDatepicker() {
        if (!this.textInput) {
            return;
        }

        this.textInput.click();
    }

    render() {
        return (
            <TextInput
                forceActiveLabel={!canUseTouchScreen()}
                ref={(el) => {
                    this.textInput = el;
                    if (typeof this.props.forwardRef === 'function') { this.props.forwardedRef(el); }
                }}
                onFocus={this.showDatepicker}
                label={this.props.label}
                onChangeText={this.setDate}
                onBlur={this.props.onBlur}
                defaultValue={this.state.value}
                placeholder={this.props.placeholder}
                errorText={this.props.errorText}
                containerStyles={this.props.containerStyles}
                disabled={this.props.disabled}
                shouldSaveDraft={this.props.shouldSaveDraft}
                isFormInput={this.props.isFormInput}
                inputID={this.props.inputID}
            />
        );
    }
}

Datepicker.propTypes = datePickerPropTypes;
Datepicker.defaultProps = defaultProps;

export default
withWindowDimensions(React.forwardRef((props, ref) => (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <Datepicker {...props} forwardedRef={ref} />
)));
