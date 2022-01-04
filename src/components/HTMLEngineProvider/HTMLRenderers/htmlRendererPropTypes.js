import PropTypes from 'prop-types';

export default {
    tnode: PropTypes.object,
    TDefaultRenderer: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    key: PropTypes.string,
    style: PropTypes.object,
};
