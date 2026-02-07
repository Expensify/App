type UpdateExpensifyCardLimitTypeParams = {
    cardID: number;
    limitType: string;
    validFrom?: string;
    validThru?: string;
    clearValidityDates?: boolean;
};

export default UpdateExpensifyCardLimitTypeParams;
