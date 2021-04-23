import PropTypes from 'prop-types';
import {withLocalizePropTypes} from '../withLocalize';

const propTypes = {
    // Callback to fire when we want to trigger the update.
    onSubmit: PropTypes.func,

    ...withLocalizePropTypes,
};

const defaultProps = {
    onSubmit: null,
};

export {propTypes, defaultProps};
