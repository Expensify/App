import React, {Component, Suspense} from 'react';
import lodashGet from 'lodash/get';
import onfidoPropTypes from './onfidoPropTypes';
import FullScreenLoadingIndicator from '../FullscreenLoadingIndicator';

// Onfido dependencies are close to 50% of total App size. We lazy load the base component
// (and it's imports) to save initial load time and avoid having unused code in memory
// The prefetch annotation hints browsers they can load this chunk during idle time
const BaseOnfidoWeb = React.lazy(() => import(/* webpackPrefetch: true */ './BaseOnfidoWeb'));

class Onfido extends Component {
    constructor(props) {
        super(props);
        this.baseOnfido = null;
    }

    componentWillUnmount() {
        const onfidoOut = lodashGet(this, 'baseOnfido.onfidoOut');
        if (!onfidoOut) {
            return;
        }

        onfidoOut.tearDown();
    }

    render() {
        // Render fallback content until the lazy component is initialized
        return (
            <Suspense fallback={<FullScreenLoadingIndicator />}>
                <BaseOnfidoWeb
                    ref={e => this.baseOnfido = e}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...this.props}
                />
            </Suspense>
        );
    }
}

Onfido.propTypes = onfidoPropTypes;

export default Onfido;
