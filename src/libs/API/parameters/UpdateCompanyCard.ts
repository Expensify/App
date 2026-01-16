type UpdateCompanyCard = {
    cardID: number;

    /** JSONCode error to simulate (e.g., 434 for broken connection). Only works in staging/dev. */
    breakConnection?: number;
};

export default UpdateCompanyCard;
