type OpenPolicyRoomsPageParams = {
    policyID: string;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: 'name' | 'memberCount';
    sortOrder?: 'asc' | 'desc';
    searchValue?: string;
};

export default OpenPolicyRoomsPageParams;
