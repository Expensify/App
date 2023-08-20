import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

const NETRC_PATH = path.join(process.env.HOME || '', '.netrc');
const GRADLE_PROPERTIES_PATH = path.join(process.env.HOME || '', '.gradle', 'gradle.properties');

async function main(): Promise<void> {
    try {
        const response = await axios.get('https://my-json-server.typicode.com/hayata-suenaga/mapbox-mock-response/token');
        const TOKEN = response.data.token;

        // iOS Configuration for .netrc
        console.log(`Configuring ${NETRC_PATH} for Mapbox iOS SDK download`);
        if (fs.existsSync(NETRC_PATH) && fs.readFileSync(NETRC_PATH, 'utf8').includes('api.mapbox.com')) {
            const updatedContent = fs.readFileSync(NETRC_PATH, 'utf8').replace(/password .*/, `password ${TOKEN}`);
            fs.writeFileSync(NETRC_PATH, updatedContent, 'utf8');
            console.log(`Token was updated in ${NETRC_PATH}`);
        } else {
            fs.appendFileSync(NETRC_PATH, `machine api.mapbox.com\nlogin mapbox\npassword ${TOKEN}\n`, 'utf8');
            console.log(`${NETRC_PATH} was configured with new credentials`);
        }

        // Ensure the .gradle directory exists
        if (!fs.existsSync(path.join(process.env.HOME || '', '.gradle'))) {
            fs.mkdirSync(path.join(process.env.HOME || '', '.gradle'));
        }

        // Android Configuration for gradle.properties
        console.log(`\nConfiguring ${GRADLE_PROPERTIES_PATH} for Mapbox Android SDK download`);
        if (fs.existsSync(GRADLE_PROPERTIES_PATH) && fs.readFileSync(GRADLE_PROPERTIES_PATH, 'utf8').includes('MAPBOX_DOWNLOADS_TOKEN')) {
            const updatedContent = fs.readFileSync(GRADLE_PROPERTIES_PATH, 'utf8').replace(/MAPBOX_DOWNLOADS_TOKEN=.*/, `MAPBOX_DOWNLOADS_TOKEN=${TOKEN}`);
            fs.writeFileSync(GRADLE_PROPERTIES_PATH, updatedContent, 'utf8');
            console.log(`Token was updated in ${GRADLE_PROPERTIES_PATH}`);
        } else {
            fs.appendFileSync(GRADLE_PROPERTIES_PATH, `MAPBOX_DOWNLOADS_TOKEN=${TOKEN}\n`, 'utf8');
            console.log(`${GRADLE_PROPERTIES_PATH} was configured with new credentials`);
        }
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error:', error.message);
            process.exit(1);
        }
    }
}

main();
