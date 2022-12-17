import ROUTES from '../../ROUTES';

export default [
    {
        pattern: `/${ROUTES.REPORT}($|(//*))`,
        comment: 'Reports',
    },
    {
        pattern: `/${ROUTES.SETTINGS}($|(//*))`,
        comment: 'Profile and app settings',
    },
    {
        pattern: '/setpassword($|(//*))',
        comment: 'Passoword setup',
    },
    {
        pattern: `/${ROUTES.DETAILS}($|(//*))`,
        comment: 'Details of another users',
    },
    {
        pattern: '/v($|(//*))',
        comment: 'Account validation',
    },
    {
        pattern: `/${ROUTES.BANK_ACCOUNT}($|(//*))`,
        comment: 'Bank account setup and its steps',
    },
    {
        pattern: '/iou($|(//*))',
        comment: 'I Owe You reports',
    },
    {
        pattern: `/${ROUTES.ENABLE_PAYMENTS}($|(//*))`,
        comment: 'Payments setup',
    },
    {
        pattern: '/statements($|(//*))',
        comment: 'Wallet statements',
    },
    {
        pattern: `/${ROUTES.CONCIERGE}($|(//*))`,
        comment: 'Concierge',
    },
];

