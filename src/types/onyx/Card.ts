type AdditionalData = {
    isBillingCard?: boolean;
    isP2PDebitCard?: boolean;
};

type AccountData = {
    additionalData?: AdditionalData;
    addressName?: string;
    addressState?: string;
    addressStreet?: string;
    addressZip?: number;
    cardMonth?: number;

    /** The masked credit card number */
    cardNumber?: string;

    cardYear?: number;
    created?: string;
    currency?: string;
    fundID?: number;
};

type Card = {
    accountData?: AccountData;
    accountType?: string;
    description?: string;
    key?: string;
    methodID?: number;
    title?: string;
};

export default Card;
