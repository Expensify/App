type OpenPlaidCompanyCardLoginParams = {
    redirectURI: string | undefined;
    androidPackage?: string;
    country: string;
    domain?: string;
    feed?: string;
    isPersonal?: boolean;
    cardID?: string;
};

export default OpenPlaidCompanyCardLoginParams;
