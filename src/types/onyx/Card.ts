type Card = {
    /** The name of the institution (bank of america, etc) */
    cardName?: string;

    /** The masked credit card number */
    cardNumber?: string;

    /** The ID of the card in the cards DB */
    cardID?: number;
};

export default Card;
