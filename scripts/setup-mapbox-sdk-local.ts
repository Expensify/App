import axios from 'axios';
import {saveMapboxToken} from './setup-mapbox-sdk';

const TOKEN_ENDPOINT = 'https://my-json-server.typicode.com/hayata-suenaga/mapbox-mock-response/token';

(async function main() {
    try {
        const response = await axios.get(TOKEN_ENDPOINT);
        const token = response.data.token;
        if (token === undefined) {
            throw new Error('Token could not be fetched');
        }
        await saveMapboxToken(token);
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error:', error.message);
            process.exit(1);
        }
    }
})();
