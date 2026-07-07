type UpdateExpensifyCardLimitTypeParams = {
    workspaceAccountID: number;
    cardID: number;
    limitType: string;
    validFrom?: string;
    validThru?: string;
    clearValidityDates?: boolean;
};

export default UpdateExpensifyCardLimitTypeParams;
