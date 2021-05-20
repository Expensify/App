import EXPENSIFY_ICON_URL from '../../../../assets/images/expensify-logo-round-clearspace.png';

export default class LocalNotification {
    /**
     * Create a Notification object.
     *
     * @param {String} title
     * @param {String} message
     * @param {Function} [onPress]
     * @param {String} [icon]
     * @param {Number} [hideAfter]
     * @param {String} [tag]
     */
    constructor(title, message, onPress = () => {}, icon = EXPENSIFY_ICON_URL, hideAfter = 0, tag = '') {
        if (!title || !message) {
            throw new Error('LocalNotification must include title and message parameter.');
        }

        this.title = title;
        this.message = message;
        this.onPress = onPress;
        this.icon = icon;
        this.hideAfter = hideAfter;
        this.tag = tag;
    }
}
