type GetWiseKYCReviewEmbeddedLinkParams = {
    bankAccountID: number;

    /** Where Wise sends the user when its form ends. Wise adds the outcome as the `status` query param */
    redirectURL: string;
};

export default GetWiseKYCReviewEmbeddedLinkParams;
