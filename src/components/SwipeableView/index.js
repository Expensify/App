import PropTypes from 'prop-types';

const propTypes = {
    children: PropTypes.element.isRequired,

};

function SwipeableView({children}) {
    return children;
}

SwipeableView.propTypes = propTypes;
SwipeableView.displayName = 'SwipeableView';
export default SwipeableView;
