import { Howl } from 'howler';
import type { ValueOf } from 'type-fest';
import config from './config';
import { SOUNDS, isMuted, withMinimalExecutionTime } from './BaseSound'
import Log from '@libs/Log';

function cacheSoundAssets() {
    if ('caches' in window) {
        caches.open('sound-assets').then(cache => {
            const soundFiles = Object.values(SOUNDS).map(sound => `${config.prefix}${sound}.mp3`);
            
            const cachePromises = soundFiles.map(soundFile => {
                return cache.match(soundFile).then(response => {
                    if (!response) {
                        return cache.add(soundFile);
                    }
                });
            });

            return Promise.all(cachePromises);
        });
    }
}

const initializeAndPlaySound = (src: string) => {
    const sound = new Howl({
        src: [src],
        format: ['mp3'],
        onloaderror: (id, error) => {
            Log.hmmm('[sound] Load error:', { message: (error as Error).message });
        },
        onplayerror: (id, error) => {
            Log.hmmm('[sound] Play error:', { message: (error as Error).message });
        },
    });

    sound.play();
};

const playSound = (soundFile: ValueOf<typeof SOUNDS>) => {
    if (isMuted) {
        return;
    }

    const soundSrc = `${config.prefix}${soundFile}.mp3`;

    if ('caches' in window) {
        caches.open('sound-assets').then(cache => {
            cache.match(soundSrc).then(response => {
                if (response) {
                    response.blob().then(soundBlob => {
                        const soundUrl = URL.createObjectURL(soundBlob);
                        initializeAndPlaySound(soundUrl);
                    });
                } else {
                    initializeAndPlaySound(soundSrc);
                }
            });
        });
    } else {
        // Fallback to fetching from network if not in cache
        initializeAndPlaySound(soundSrc);
    }
};
// Cache sound assets on load
cacheSoundAssets();

export { SOUNDS };
export default withMinimalExecutionTime(playSound, 300);