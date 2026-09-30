import {useEffect, useState} from 'react';

/**
 * The last icons drawn, held by the caller outside any component so a remounted navigator starts from them instead
 * of waiting for Skia again. While a new set is being drawn, the bar keeps showing these.
 */
type LastDrawnTabIcons<T> = {current?: T};

/**
 * Draws tab icons off-screen again whenever the signature of everything baked into them changes, and never while
 * it is undefined. A failed draw keeps the previous icons, or resolves to `fallbackOnError` when there are none.
 */
function useRasterizedTabIcons<T>(lastDrawn: LastDrawnTabIcons<T>, signature: string | undefined, draw: (signature: string) => Promise<T | undefined>, fallbackOnError?: T): T | undefined {
    const [icons, setIcons] = useState<T | undefined>(lastDrawn.current);

    useEffect(() => {
        let isActive = true;
        if (signature !== undefined) {
            draw(signature)
                .then((result) => {
                    if (!isActive || result === undefined) {
                        return;
                    }
                    // eslint-disable-next-line no-param-reassign
                    lastDrawn.current = result;
                    setIcons(result);
                })
                .catch(() => {
                    if (!isActive || fallbackOnError === undefined) {
                        return;
                    }
                    setIcons((previous) => previous ?? fallbackOnError);
                });
        }

        return () => {
            isActive = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [signature]);

    return icons;
}

export default useRasterizedTabIcons;
export type {LastDrawnTabIcons};
