import React from 'react';
import {Button, View} from 'react-native';
import PropTypes from 'prop-types';
import DatePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import ExpensiTextInput from '../ExpensiTextInput';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import Popover from '../Popover';
import CONST from '../../CONST';
import styles from '../../styles/styles';
import colors from '../../styles/colors';

const propTypes = {
    label: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
    placeholder: PropTypes.string,
    errorText: PropTypes.string,
    translateX: PropTypes.number,
    containerStyles: PropTypes.arrayOf(PropTypes.object),
    ...withLocalizePropTypes,
};

const defaultProps = {
    value: undefined,
    placeholder: 'Select Date',
    errorText: '',
    translateX: undefined,
    containerStyles: [],
};

class DatepickerNative extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showPicker: false,
        };

        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
        this.discard = this.discard.bind(this);
        this.raiseDateChange = this.raiseDateChange.bind(this);
    }

    show() {
        this.initialValue = this.props.value;
        this.setState({showPicker: true});
        this.input.blur();
    }

    discard() {
        this.hide();
        this.props.onChange(this.initialValue);
    }

    hide() {
        this.setState({showPicker: false});
    }

    raiseDateChange(event, date) {
        this.props.onChange(date);
    }

    render() {
        const {
            value,
            label,
            placeholder,
            errorText,
            translateX,
            containerStyles,
        } = this.props;

        return (
            <>
                <ExpensiTextInput
                    ref={input => this.input = input}
                    label={label}
                    value={value ? moment(value).format(CONST.DATE.MOMENT_FORMAT_STRING) : ''}
                    placeholder={placeholder}
                    errorText={errorText}
                    containerStyles={containerStyles}
                    translateX={translateX}
                    onFocus={this.show}
                />
                <Popover
                    isVisible={this.state.showPicker}
                    onClose={this.hide}
                >
                    <View style={[
                        styles.flexRow,
                        styles.flexWrap,
                        styles.justifyContentBetween,
                        styles.borderBottom,
                        styles.pb1,
                        styles.ph4,
                    ]}
                    >
                        <Button title={this.props.translate('common.cancel')} color={colors.red} onPress={this.discard} />
                        <Button title={this.props.translate('common.save')} color={colors.blue} onPress={this.hide} />
                    </View>
                    <DatePicker
                        value={value ? new Date(value) : new Date()}
                        mode="date"
                        display="spinner"
                        onChange={this.raiseDateChange}
                    />
                </Popover>
            </>
        );
    }
}

DatepickerNative.propTypes = propTypes;
DatepickerNative.defaultProps = defaultProps;

export default withLocalize(DatepickerNative);
