import React from 'react';
import PropTypes from 'prop-types';
import ReactConfetti from 'react-confetti';

const propTypes = {
    /** Triggers confetti */
    trigger: PropTypes.bool,
};

const defaultProps = {
    trigger: false,
};

const Confetti = (props) => {
    const [toggle, setToggle] = React.useState(false);

    React.useEffect(() => {
        setToggle((prevToggle) => {
            if (prevToggle) {
                return true;
            }
            return props.trigger;
        });
    }, [props.trigger]);

    return toggle ? <ReactConfetti gravity={0.05} recycle={false} onConfettiComplete={() => setToggle(false)} /> : null;
};

Confetti.propTypes = propTypes;
Confetti.defaultProps = defaultProps;
Confetti.displayName = 'Confetti';

export default Confetti;
