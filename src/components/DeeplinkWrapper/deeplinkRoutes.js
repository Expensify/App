import ROUTES from '../../ROUTES';

/** @type {Array<object>} Routes regex used for desktop deeplinking */
export default [
    {
        // /reports/*
        pattern: `/${ROUTES.REPORT}($|(//*))`,
    },
    {
        // /settings/*
        pattern: `/${ROUTES.SETTINGS}($|(//*))`,
    },
    {
        // /setpassword/*
        pattern: '/setpassword($|(//*))',
    },
    {
        // /details/*
        pattern: `/${ROUTES.DETAILS}($|(//*))`,
    },
    {
        // /v/*
        pattern: '/v($|(//*))',
    },
    {
        // /bank-account/*
        pattern: `/${ROUTES.BANK_ACCOUNT}($|(//*))`,
    },
    {
        // /iou/*
        pattern: '/iou($|(//*))',
    },
    {
        // /enable-payments/*
        pattern: `/${ROUTES.ENABLE_PAYMENTS}($|(//*))`,
    },
    {
        // /statements/*
        pattern: '/statements($|(//*))',
    },
    {
        // /concierge/*
        pattern: `/${ROUTES.CONCIERGE}($|(//*))`,
    },
];

