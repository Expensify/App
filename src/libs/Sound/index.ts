import {Howl} from 'howler';
import type {ValueOf} from 'type-fest';
import Log from '@libs/Log';
import {getIsMuted, SOUNDS, withMinimalExecutionTime} from './BaseSound';
import config from './config';

function cacheSoundAssets() {
    // Exit early if the Cache API is not available in the current browser.
    if (!('caches' in window)) {
        return;
    }

    caches.open('sound-assets').then((cache) => {
        const soundFiles = Object.values(SOUNDS).map((sound) => `${config.prefix}${sound}.mp3`);

        // Cache each sound file if it's not already cached.
        const cachePromises = soundFiles.map((soundFile) => {
            return cache.match(soundFile).then((response) => {
                if (response) {
                    return;
                }
                return cache.add(soundFile);
            });
        });

        return Promise.all(cachePromises);
    });
}

const initializeAndPlaySound = (src: string) => {
    const sound = new Howl({
        src: [src],
        format: ['mp3'],
        onloaderror: (_id: number, error: unknown) => {
            Log.alert('[sound] Load error:', {message: (error as Error).message});
        },
        onplayerror: (_id: number, error: unknown) => {
            Log.alert('[sound] Play error:', {message: (error as Error).message});
        },
    });
    sound.play();
};

const playSound = (soundFile: ValueOf<typeof SOUNDS>) => {
    if (getIsMuted()) {
        return;
    }

    const soundSrc = `${config.prefix}${soundFile}.mp3`;

    if (!('caches' in window)) {
        // Fallback to fetching from network if not in cache
        initializeAndPlaySound(soundSrc);
        return;
    }

    caches.open('sound-assets').then((cache) => {
        cache.match(soundSrc).then((response) => {
            if (response) {
                response.blob().then((soundBlob) => {
                    const soundUrl = URL.createObjectURL(soundBlob);
                    initializeAndPlaySound(soundUrl);
                });
                return;
            }
            initializeAndPlaySound(soundSrc);
        });
    });
};

function clearSoundAssetsCache() {
    // Exit early if the Cache API is not available in the current browser.
    if (!('caches' in window)) {
        return;
    }

    caches
        .delete('sound-assets')
        .then((success) => {
            if (success) {
                return;
            }
            Log.alert('[sound] Failed to clear sound assets cache.');
        })
        .catch((error) => {
            Log.alert('[sound] Error clearing sound assets cache:', {message: (error as Error).message});
        });
}

// Cache sound assets on load
cacheSoundAssets();

export {SOUNDS, clearSoundAssetsCache};
export default withMinimalExecutionTime(playSound, 300);
