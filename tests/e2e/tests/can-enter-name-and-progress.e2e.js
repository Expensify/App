const Actions = require('../actions/actions');

describe('Test', () => {
    const actions = new Actions();
    // eslint-disable-next-line @lwc/lwc/no-async-await
    it('should be able to enter a name, submit and progress to next screen', async () => {
        const login = await $('~welcome').waitForDisplayed(1000);
        const element = $('~welcome');
        expect(element.getValue()).toBe('Welcome to React Native!');
    });
});
