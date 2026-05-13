import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

function startTestDrive() {
    Navigation.navigate(ROUTES.TEST_DRIVE_DEMO_ROOT);
}

// eslint-disable-next-line import/prefer-default-export
export {startTestDrive};
