
import React, {Component} from 'react';
import _ from 'underscore';
import IOUAmount from './IOUAmount';
import {calculateAmountLength, validateAmount, replaceAllDigits} from '../../../../libs/IOUAmountUtils';

class IOUAmountPage extends Component {
    constructor(props) {
        super(props);
        this.calculateAmountLength = calculateAmountLength.bind(this);
        this.validateAmount = this.validateAmount.bind(this);
        this.replaceAllDigits = replaceAllDigits.bind(this);
        this.stripCommaFromAmount = this.stripCommaFromAmount.bind(this);
        this.calculateAmountAndSelection = this.calculateAmountAndSelection.bind(this);
    }

    render() {
        return (
            <IOUAmount
                calculateAmountAndSelection={this.calculateAmountAndSelection}
                replaceAllDigits={this.replaceAllDigits}
                stripCommaFromAmount={this.stripCommaFromAmount}
                validateAmount={this.validateAmount}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...this.props}
            />
        );
    }
}

export default IOUAmountPage;
