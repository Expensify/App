import {Freeze} from 'react-freeze';
import PropTypes from 'prop-types';

const propTypes = {
    /** JSX element to be rendered when the screen is frozen */
    skeletonPlaceholder: PropTypes.element.isRequired,

    /** Whether the screen should be frozen */
    shouldFreeze: PropTypes.bool.isRequired,

    /** Children to wrap in SidebarFreeze. */
    children: PropTypes.node.isRequired,
};

function SidebarFreeze(props) {
    return (
        <Freeze freeze={props.shouldFreeze} placeholder={props.skeletonPlaceholder}>
            {props.children}
        </Freeze>
    );
}

SidebarFreeze.propTypes = propTypes;

export default SidebarFreeze;
