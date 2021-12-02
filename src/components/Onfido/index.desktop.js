import BaseOnfido from './BaseOnfido';
import onfidoPropTypes from './onfidoPropTypes';

// On desktop, we do not want to teardown onfido, because it causes a crash.
// See https://github.com/Expensify/App/issues/6082
const Onfido = BaseOnfido;

Onfido.propTypes = onfidoPropTypes;
Onfido.displayName = 'Onfido';

export default Onfido;
