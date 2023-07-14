import PropTypes from 'prop-types';

export default PropTypes.shape({
    legalFirstName: PropTypes.string,
    legalLastName: PropTypes.string,
    dob: PropTypes.string,

    /** User's home address */
    address: PropTypes.shape({
        street: PropTypes.string,
        city: PropTypes.string,
        state: PropTypes.string,
        zip: PropTypes.string,
        country: PropTypes.string,
    }),
});

const privatePersonalDetailsDefaultProps = {
    legalFirstName: '',
    legalLastName: '',
    dob: '',
    address: {
        street: '',
        street2: '',
        city: '',
        state: '',
        zip: '',
        country: '',
    },
};

export {privatePersonalDetailsDefaultProps};
