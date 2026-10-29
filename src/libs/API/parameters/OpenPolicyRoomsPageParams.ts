type OpenPolicyRoomsPageParams = {
    policyID: string;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: 'name' | 'members';
    sortOrder?: 'asc' | 'desc';
    searchValue?: string;
};

export default OpenPolicyRoomsPageParams;
