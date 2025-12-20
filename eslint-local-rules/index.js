/**
 * Local ESLint plugin for custom rules
 */

module.exports = {
    rules: {
        'react-compiler-check': require('./rules/react-compiler-check'),
    },
};
