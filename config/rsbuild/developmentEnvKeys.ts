/** Local backends from `.env`, which the app calls and the launcher adds to the live Worker's CSP. */
const LOCAL_BACKEND_URL_KEYS = ['EXPENSIFY_URL', 'SECURE_EXPENSIFY_URL', 'STAGING_EXPENSIFY_URL', 'STAGING_SECURE_EXPENSIFY_URL', 'NGROK_URL', 'SECURE_NGROK_URL'];

/** Public development settings that shell variables can override in the app config. Never forward arbitrary shell variables, which may contain secrets. */
const FORWARDED_DEVELOPMENT_ENV_KEYS = [...LOCAL_BACKEND_URL_KEYS, 'USE_WEB_PROXY', 'USE_NGROK', 'NEW_EXPENSIFY_URL', 'SKIP_ONBOARDING', 'PUSHER_APP_KEY', 'PUSHER_DEV_SUFFIX'];

export {FORWARDED_DEVELOPMENT_ENV_KEYS, LOCAL_BACKEND_URL_KEYS};
