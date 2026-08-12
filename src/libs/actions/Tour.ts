import Navigation from '@libs/Navigation/Navigation';

import ROUTES from '@src/ROUTES';

function startTestDrive() {
    Navigation.navigate(ROUTES.TEST_DRIVE_DEMO_ROOT);
}

/* oxlint-disable-next-line hosted/prefer-default-export */ // eslint-disable-next-line import/prefer-default-export
export {startTestDrive};
