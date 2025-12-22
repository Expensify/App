import {reverseGeocodeAsync} from 'expo-location';

async function addressFromGpsPoint(gpsPoint: {lat: number; long: number}): Promise<string | null> {
    try {
        const [location] = await reverseGeocodeAsync({latitude: gpsPoint.lat, longitude: gpsPoint.long});

        if (!location) {
            return null;
        }

        const address: string = location?.formattedAddress ?? [location?.name, location?.city, location?.region].filter(Boolean).join(', ');

        return address;
    } catch (error) {
        console.error('[GPS distance request] Failed to reverse geocode location to postal address: ', error);
        return null;
    }
}

export default addressFromGpsPoint;
