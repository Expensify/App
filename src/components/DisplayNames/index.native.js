import React from 'react';
import {propTypes, defaultProps} from './displayNamesPropTypes';
import ExpensifyText from '../ExpensifyText';

// As we don't have to show tooltips of the Native platform so we simply render the full display names list.
const DisplayNames = props => (
    <ExpensifyText style={props.textStyles} numberOfLines={props.numberOfLines}>
        {props.fullTitle}
    </ExpensifyText>
);

DisplayNames.propTypes = propTypes;
DisplayNames.defaultProps = defaultProps;
DisplayNames.displayName = 'DisplayNames';

export default DisplayNames;
