type SearchParams = {
    hash: number;
    query: string;
    policyIDs?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    offset: number;
};

export default SearchParams;
