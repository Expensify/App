/* eslint-disable react/jsx-props-no-multi-spaces */
import _ from 'underscore';
import React, {forwardRef, Component} from 'react';
import PropTypes from 'prop-types';
import {FlatList, View} from 'react-native';
import MenuItem from '../../../components/MenuItem';

const propTypes = {
    // Same as FlatList can be any array of anything
    data: PropTypes.arrayOf(PropTypes.any),

    // What to do when a menu item is pressed
    onPress: PropTypes.func.isRequired,
};

const defaultProps = {
    data: [],
};

class PaymentMethodList extends Component {
    constructor(props) {
        super(props);

        this.renderItem = this.renderItem.bind(this);
    }

    /**
     * Render item method wraps the prop renderItem to render in a
     * View component so we can attach an onLayout handler and
     * measure it when it renders.
     *
     * @param {Object} params
     * @param {Object} params.item
     * @param {Number} params.index
     *
     * @return {React.Component}
     */
    renderItem({item, index}) {
        return (
            <MenuItem
                onPress={() => this.props.onPress(index)}
                title={item.primaryText}
                icon={item.icon}
                key={`paymentMethod-${index}`}
            />
        );
    }

    render() {
        return (
            <FlatList
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...this.props}
                inverted
                renderItem={this.renderItem}
                bounces
                windowSize={15}
            />
        );
    }
}

PaymentMethodList.propTypes = propTypes;
PaymentMethodList.defaultProps = defaultProps;

export default forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <PaymentMethodList {...props} innerRef={ref} />
));
