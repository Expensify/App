import PropTypes from 'prop-types';

const stylePropTypes = PropTypes.oneOfType([PropTypes.object, PropTypes.arrayOf(PropTypes.object), PropTypes.func]);

export default stylePropTypes;
