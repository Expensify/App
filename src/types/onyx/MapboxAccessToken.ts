/** Model of Mapbox access token data */
type MapboxAccessToken = {
    /** Mapbox access token */
    token: string;

    /** Mapbox access token expiration date */
    expiration: string;

    /** Mapbox access error messages */
    errors: string[];
};

export default MapboxAccessToken;
