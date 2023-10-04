import React, {useEffect, useRef} from 'react';
import lodashGet from 'lodash/get';
import BaseOnfidoWeb from './BaseOnfidoWeb';
import onfidoPropTypes from './onfidoPropTypes';

const Onfido = (props) => {
    const baseOnfidoRef = useRef(null);

    useEffect(() => {
        return () => {
            const onfidoOut = lodashGet(baseOnfidoRef.current, 'onfidoOut');
            if (!onfidoOut) {
                return;
            }

            onfidoOut.tearDown();
        };
    }, []);

    return (
        <BaseOnfidoWeb
            ref={baseOnfidoRef}
            {...props}
        />
    );
};

Onfido.propTypes = onfidoPropTypes;
Onfido.displayName = 'Onfido';

export default Onfido;
