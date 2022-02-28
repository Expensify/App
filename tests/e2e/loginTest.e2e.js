/* eslint-disable @lwc/lwc/no-async-await */
/* eslint-env detox/detox */
// jest.setTimeout(120000 * 10);

describe('Test login page', () => {
    beforeEach(() => device.launchApp({permissions: {notifications: 'YES'}, newInstance: true}));

    it('should have a Log In button visible', () => expect(element(by.text('Continue'))).toBeVisible());

    it('should have a Log In button visible', async () => {

        // Enter email or phone number
        await waitFor(element(by.id('username'))).toBeVisible();
        await element(by.id('username')).typeText('marcochavezf+test1@gmail.com');
        await element(by.text('Continue')).tap();

        // Enter password
        await waitFor(element(by.id('password'))).toBeVisible();
        await element(by.id('password')).typeText('Password1');
        await element(by.text('Sign in')).tap();

        // Wait for Avatar to appear and click on it
        await waitFor(element(by.id('avatar'))).toBeVisible();
        await element(by.id('avatar')).tap();

        // Click on Profile
        await element(by.text('Profile')).tap();

        // Change Profile name
        await waitFor(element(by.id('firstName'))).toBeVisible();
        await element(by.id('firstName')).replaceText(`Marco ${Math.floor(Math.random() * 10)}`);
        await element(by.text('Save')).tap();

        // Verify the growl message was displayed
        await expect(element(by.text('Your profile was successfully saved'))).toBeVisible();
    });
});
