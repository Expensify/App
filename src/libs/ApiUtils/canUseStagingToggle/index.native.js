import CONST from '../../../CONST';
import * as Environment from '../../Environment/Environment';

// To avoid rebuilding native apps, native apps use production config for both staging and prod
// Choosing between staging and prod is only available on staging
// In development we default to the production api
let IS_STAGING_ENV = false;
Environment.getEnvironment()
    .then((envName) => {
        IS_STAGING_ENV = envName === CONST.ENVIRONMENT.STAGING;
    });

export default function canUseStagingToggle() {
    return IS_STAGING_ENV;
}
