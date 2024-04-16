import PropTypes from 'prop-types';

const stylePropTypes = PropTypes.oneOfType([PropTypes.object, PropTypes.bool, PropTypes.arrayOf(PropTypes.object), PropTypes.func]);

export default stylePropTypes;
