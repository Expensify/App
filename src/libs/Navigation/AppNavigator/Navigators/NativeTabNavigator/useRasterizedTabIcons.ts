import {useEffect, useState} from 'react';

/** Held outside any component, so a remounted navigator starts from the last icons instead of waiting for Skia. */
type LastDrawnTabIcons<T> = {current?: T};

/** A failed draw keeps the previous icons, or resolves to `fallbackOnError` when there are none. */
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
