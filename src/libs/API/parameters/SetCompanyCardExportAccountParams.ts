type SetCompanyCardExportAccountParams = {
    authToken?: string | null;
    cardID: number;
    exportAccountDetails: Record<string, string>;
};

export default SetCompanyCardExportAccountParams;
