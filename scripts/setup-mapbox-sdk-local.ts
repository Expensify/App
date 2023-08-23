/**
 * Mapbox SDK Token Fetcher
 * ========================
 *
 * Used in local development environment. Can be invoked with `npm run configure-mapbox`.
 *
 * Invokes an Expensify API endpoint to fetch a temporary Mapbox token necessary
 * to download Mapbox iOS and Android SDKs. Saves the token fetched in relevant files
 * on local machine.
 */

import {get} from 'https';
import {saveMapboxToken} from './setup-mapbox-sdk';

const TOKEN_ENDPOINT = 'https://www.expensify.com/api.php?command=GetMapboxSDKToken';

function fetchData(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
        get(url, (res) => {
            const contentType = res.headers['content-type'] || '';
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (!contentType.includes('application/json')) {
                    return reject(new Error('Unexpected content type: ' + contentType));
                }

                resolve(JSON.parse(data));
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
}

fetchData(TOKEN_ENDPOINT)
    .then((token) => {
        console.log(token);
        if (typeof token !== 'string') {
            throw new Error('Token could not be fetched or token is of a wrong type');
        }

        saveMapboxToken(token);
    })
    .catch((error) => {
        if (error instanceof Error) {
            console.error('Error:', error.message);
        }
        process.exit(1);
    });
