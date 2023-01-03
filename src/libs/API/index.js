import CONFIG from '../../CONFIG';

if (CONFIG.IS_MOCK_API) {
    // eslint-disable-next-line global-require
    module.exports = require('./API.mock');
} else {
    module.exports = require('./API');
}
