import PropTypes from 'prop-types';

export default PropTypes.shape({
    /** The name of the institution (bank of america, etc) */
    cardName: PropTypes.string,

    /** The masked credit card number */
    cardNumber: PropTypes.string,

    /** The ID of the card in the cards DB */
    cardID: PropTypes.number,
});
