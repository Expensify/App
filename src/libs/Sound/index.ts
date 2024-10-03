
import { Howl } from 'howler';
import type { ValueOf } from 'type-fest';
import config from './config';
import { SOUNDS, isMuted, withMinimalExecutionTime } from './BaseSound'

async function cacheSoundAssets() {
    if ('caches' in window) {
        const cache = await caches.open('sound-assets');
        const soundFiles = Object.values(SOUNDS).map(sound => `${config.prefix}${sound}.mp3`);
        
        const cachePromises = soundFiles.map(async (soundFile) => {
            const response = await cache.match(soundFile);
            if (!response) {
                await cache.add(soundFile);
                console.log('[wildebug] Sound asset cached:', soundFile);
            } else {
                console.log('[wildebug] Sound asset already cached:', soundFile);
            }
        });

        await Promise.all(cachePromises);
        console.log('[wildebug] Sound assets caching completed');
    }
}
const playSound = async (soundFile: ValueOf<typeof SOUNDS>) => {
    if (isMuted) {
        console.log('[wildebug] Sound is muted');
        return;
    }

    const soundSrc = `${config.prefix}${soundFile}.mp3`;
    console.log('[wildebug] Playing sound:', soundSrc);

    if ('caches' in window) {
        const cache = await caches.open('sound-assets');
        const response = await cache.match(soundSrc);

        if (response) {
            const soundBlob = await response.blob();
            const soundUrl = URL.createObjectURL(soundBlob);
            console.log('[wildebug] Sound fetched from cache:', soundUrl);

            const sound = new Howl({
                src: [soundUrl],
                format: ['mp3'],
                onloaderror: (id, error) => {
                    console.error('[wildebug] Load error:', error);
                },
                onplayerror: (id, error) => {
                    console.error('[wildebug] Play error:', error);
                },
            });

            sound.play();
            return;
        } else {
            console.log('[wildebug] Sound not found in cache, fetching from network');
        }
    }

    // Fallback to fetching from network if not in cache
    const sound = new Howl({
        src: [soundSrc],
        onloaderror: (id, error) => {
            console.error('[wildebug] Load error:', error);
        },
        onplayerror: (id, error) => {
            console.error('[wildebug] Play error:', error);
        },
    });

    sound.play();
};
// Cache sound assets on load
cacheSoundAssets();

export { SOUNDS };
export default withMinimalExecutionTime(playSound, 300);
