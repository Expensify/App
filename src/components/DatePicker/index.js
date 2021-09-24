import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import ExpensiTextInput from '../ExpensiTextInput';
import CONST from '../../CONST';

const propTypes = {
    label: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
    placeholder: PropTypes.string,
    errorText: PropTypes.string,
    translateX: PropTypes.number,
    containerStyles: PropTypes.arrayOf(PropTypes.object),
};

const defaultProps = {
    value: undefined,
    placeholder: 'Select Date',
    errorText: '',
    translateX: undefined,
    containerStyles: [],
};

class WebDatepicker extends React.Component {
    constructor(props) {
        super(props);

        this.raiseDateChange = this.raiseDateChange.bind(this);

        /* We're using uncontrolled input otherwise it wont be possible to
        * raise change events with a date value - each change will produce a date
        * and make us reset the text input */
        this.defaultValue = props.value
            ? moment(props.value).format(CONST.DATE.MOMENT_FORMAT_STRING)
            : '';
    }

    componentDidMount() {
        if (this.inputRef) {
            // Adds nice native datepicker on web/desktop. Not possible to set this through props
            this.inputRef.type = 'date';
        }
    }

    /**
     * Trigger the `onChange` handler when the user input has a complete date or is cleared
     * @param {string} text
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

    render() {
        const {
            label,
            placeholder,
            errorText,
            translateX,
            containerStyles,
        } = this.props;

        return (
            <ExpensiTextInput
                forceActiveLabel
                ref={input => this.inputRef = input}
                label={label}
                onChangeText={this.raiseDateChange}
                defaultValue={this.defaultValue}
                placeholder={placeholder}
                errorText={errorText}
                containerStyles={containerStyles}
                translateX={translateX}
            />
        );
    }
}

WebDatepicker.propTypes = propTypes;
WebDatepicker.defaultProps = defaultProps;

export default WebDatepicker;
