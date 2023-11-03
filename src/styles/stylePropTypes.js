import PropTypes from 'prop-types';

export default PropTypes.oneOfType([PropTypes.object, PropTypes.arrayOf(PropTypes.object), PropTypes.func]);
