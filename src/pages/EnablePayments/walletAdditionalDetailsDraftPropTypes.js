import PropTypes from 'prop-types';

export default PropTypes.shape({
    legalFirstName: PropTypes.string,
    legalLastName: PropTypes.string,
    addressStreet: PropTypes.string,
    addressCity: PropTypes.string,
    addressState: PropTypes.string,
    addressZip: PropTypes.string,
    phoneNumber: PropTypes.string,
    dob: PropTypes.string,
    ssn: PropTypes.string,
});
