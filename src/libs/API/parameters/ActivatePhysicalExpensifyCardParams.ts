import type SetPersonalDetailsAndShipExpensifyCardsParams from './SetPersonalDetailsAndShipExpensifyCardsParams';

/** Personal details the cardholder confirms while activating a card shipped to an address their admin entered */
type ActivatePhysicalCardPersonalDetails = Omit<SetPersonalDetailsAndShipExpensifyCardsParams, 'validateCode' | 'legalFirstName' | 'legalLastName'>;

type ActivatePhysicalExpensifyCardParams = {
    cardLastFourDigits: string;
    cardID: number;
} & Partial<ActivatePhysicalCardPersonalDetails>;

export default ActivatePhysicalExpensifyCardParams;
export type {ActivatePhysicalCardPersonalDetails};
