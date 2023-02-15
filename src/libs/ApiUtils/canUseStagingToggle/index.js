import CONFIG from '../../../CONFIG';

// To avoid rebuilding native apps, native apps use production config for both staging and prod
// But desktop and web do use separate staging and prod configs, so we default to CONFIG
// In development we default to the production api
// Choosing between staging and prod is only available on staging
export default function canUseStagingToggle() {
    return CONFIG.IS_IN_STAGING;
}
