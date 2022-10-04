import PropTypes from 'prop-types';

export default PropTypes.shape({
    // The type of the action item fragment. Used to render a corresponding component
    type: PropTypes.string.isRequired,

    // The text content of the fragment.
    text: PropTypes.string.isRequired,

    // Used to apply additional styling. Style refers to a predetermined constant and not a class name. e.g. 'normal'
    // or 'strong'
    style: PropTypes.string,

    // ID of a report
    reportID: PropTypes.string,

    // ID of a policy
    policyID: PropTypes.string,

    // The target of a link fragment e.g. '_blank'
    target: PropTypes.string,

    // The destination of a link fragment e.g. 'https://www.expensify.com'
    href: PropTypes.string,

    // An additional avatar url - not the main avatar url but used within a message.
    iconUrl: PropTypes.string,
});
