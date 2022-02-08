import React from 'react';
import moment from 'moment';
import TextInput from '../TextInput';
import CONST from '../../CONST';
import {propTypes, defaultProps} from './datepickerPropTypes';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';
import './styles.css';

const datePickerPropTypes = {
    ...propTypes,
    ...windowDimensionsPropTypes,
};

class Datepicker extends React.Component {
    constructor(props) {
        super(props);

        this.raiseDateChange = this.raiseDateChange.bind(this);
        this.showDatepicker = this.showDatepicker.bind(this);

        this.defaultValue = props.defaultValue
            ? moment(props.defaultValue).format(CONST.DATE.MOMENT_FORMAT_STRING)
            : undefined;
    }

    componentDidMount() {
        // Adds nice native datepicker on web/desktop. Not possible to set this through props
        this.textInput.setAttribute('type', 'date');
        this.textInput.classList.add('expensify-datepicker');
        if (this.props.maximumDate) {
            this.textInput.setAttribute('max', moment(this.props.maximumDate).format(CONST.DATE.MOMENT_FORMAT_STRING));
        }
    }

    /**
     * Trigger the `onChange` handler when the user input has a complete date or is cleared
     * @param {String} text
     */
    raiseDateChange(text) {
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
        const dateAsText = this.props.value ? moment(this.props.value).format(CONST.DATE.MOMENT_FORMAT_STRING) : '';
        return (
            <TextInput
                forceActiveLabel={!this.props.isSmallScreenWidth}
                ref={(el) => {
                    this.textInput = el;
                    if (this.props.forwardedRef) { this.props.forwardedRef(el); }
                }}
                onFocus={this.showDatepicker}
                label={this.props.label}
                onChangeText={this.raiseDateChange}
                onBlur={this.props.onBlur}
                value={dateAsText}
                defaultValue={this.defaultValue}
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
