import lodashGet from 'lodash/get';
import React, {useEffect, useRef} from 'react';
import BaseOnfidoWeb from './BaseOnfidoWeb';
import onfidoPropTypes from './onfidoPropTypes';

function Onfido({sdkToken, onSuccess, onError, onUserExit}) {
    const baseOnfidoRef = useRef(null);

    useEffect(
        () => () => {
            const onfidoOut = lodashGet(baseOnfidoRef.current, 'onfidoOut');
            if (!onfidoOut) {
                return;
            }

            onfidoOut.tearDown();
        },
        [],
    );

    return (
        <BaseOnfidoWeb
            ref={baseOnfidoRef}
            sdkToken={sdkToken}
            onSuccess={onSuccess}
            onError={onError}
            onUserExit={onUserExit}
        />
    );
}

Onfido.propTypes = onfidoPropTypes;
Onfido.displayName = 'Onfido';

export default Onfido;
