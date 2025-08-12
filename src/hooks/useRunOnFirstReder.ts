import {useEffect, useRef} from 'react';
import useBeforeRemove from './useBeforeRemove';

function useRunOnFirstRender(firstRenderCb: () => void, condition = true) {
    const firstRenderRef = useRef(true);

    useEffect(() => {
        if (!firstRenderRef.current || condition) {
            return;
        }
        firstRenderRef.current = false;
        firstRenderCb();
        // We only want to send validate code on first render not on change of condition, so we don't add it as a dependency.
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [firstRenderCb]);

    useBeforeRemove(() => {
        firstRenderRef.current = true;
    });
}

export default useRunOnFirstRender;
