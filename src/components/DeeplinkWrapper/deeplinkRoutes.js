import ROUTES from '../../ROUTES';

/** @type {Array<object>} Routes regex used for desktop deeplinking */
export default [
    {
        // /reports/*
        pattern: `/${ROUTES.REPORT}($|(//*))`,
        comment: 'Reports',
    },
    {
        // /settings/*
        pattern: `/${ROUTES.SETTINGS}($|(//*))`,
        comment: 'Profile and app settings',
    },
    {
        // /setpassword/*
        pattern: '/setpassword($|(//*))',
        comment: 'Passoword setup',
    },
    {
        // /details/*
        pattern: `/${ROUTES.DETAILS}($|(//*))`,
        comment: 'Details of another users',
    },
    {
        // /v/*
        pattern: '/v($|(//*))',
        comment: 'Account validation',
    },
    {
        // /bank-account/*
        pattern: `/${ROUTES.BANK_ACCOUNT}($|(//*))`,
        comment: 'Bank account setup and its steps',
    },
    {
        // /iou/*
        pattern: '/iou($|(//*))',
        comment: 'I Owe You reports',
    },
    {
        // /enable-payments/*
        pattern: `/${ROUTES.ENABLE_PAYMENTS}($|(//*))`,
        comment: 'Payments setup',
    },
    {
        // /statements/*
        pattern: '/statements($|(//*))',
        comment: 'Wallet statements',
    },
    {
        // /concierge/*
        pattern: `/${ROUTES.CONCIERGE}($|(//*))`,
        comment: 'Concierge',
    },
];

