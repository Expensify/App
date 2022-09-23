// This isn't a jest test, but just a node js script

// Steps:
// - Pre-step: Build the app, using the .env.e2e file - or should this have happened before? Yes that's better as for multiple test we might need the same app
// The same for app test cases:
// - Install the app to the currently available android device, expecting only one device to be connected
// - Start the app

// - Setup the app: login
// - Define the test procedure:
//   - Start the app
//   - Get TTI values
// - Run the test procedures X times (X = 5)

const installApp = require('./utils/installApp');
const launchApp = require('./utils/launchApp');

installApp('android');
launchApp('android');

