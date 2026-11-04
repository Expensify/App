type GetWiseKYCReviewEmbeddedLinkParams = {
    bankAccountID: number;

    /** Where Wise sends the user when its form ends. Wise adds the outcome as the `status` query param */
    redirectUrl: string;
};

export default GetWiseKYCReviewEmbeddedLinkParams;
