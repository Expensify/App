import axios from 'axios';
import {saveMapboxToken} from './setup-mapbox-sdk';

const TOKEN_ENDPOINT = 'https://www.expensify.com/api.php?command=GetMapboxSDKToken';

(async function main() {
    try {
        const response = await axios.get(TOKEN_ENDPOINT);
        const token = response.data?.token;
        if (typeof token !== 'string') {
            throw new Error('Token could not be fetched or token is of a wrong type');
        }
        await saveMapboxToken(token);
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error:', error.message);
            process.exit(1);
        }
    }
})();
