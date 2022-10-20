const DEFAULT_ACTION_TIMEOUT = 15000;

class Actions {
    // eslint-disable-next-line @lwc/lwc/no-async-await
    getElement = async function (locator, timeout = DEFAULT_ACTION_TIMEOUT) {
        if (!locator) { throw new Error('Locator not specified'); }

        const element = await $(locator);
        await element.waitForDisplayed({timeout});
        return element;
    };

    // eslint-disable-next-line @lwc/lwc/no-async-await
    clickElement = async function (locator, timeout = DEFAULT_ACTION_TIMEOUT) {
        const button = await this.getElement(locator, timeout);
        await button.click();
    };

    // eslint-disable-next-line @lwc/lwc/no-async-await
    inputContent = async function (locator, value = '', timeout = DEFAULT_ACTION_TIMEOUT) {
        const element = await this.getElement(locator, timeout);
        await element.setValue(value);
    };
}

module.exports = Actions;
