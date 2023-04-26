import PropTypes from 'prop-types';

const propTypes = {
    /** Children to wrap in SidebarFreeze. */
    children: PropTypes.node.isRequired,
};

function SidebarFreeze(props) {
    return (
        <>
            {props.children}
        </>
    );
}

SidebarFreeze.propTypes = propTypes;

export default SidebarFreeze;
