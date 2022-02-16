import React, {Component} from 'react';
import NewChatPage from './NewChatPage';
import CONST from '../CONST';
import KeyboardShortcut from '../libs/KeyboardShortcut';

class NewGroupPage extends Component {
    componentDidMount() {
        const enterConfig = CONST.KEYBOARD_SHORTCUTS.ENTER;
        const modifiers = KeyboardShortcut.getShortcutModifiers(['CTRL']);
        this.unsubscribeCTRLEnter = KeyboardShortcut.subscribe(
            enterConfig.shortcutKey,
            () => {
                if (!this.newChatPage) {
                    return;
                }
                this.newChatPage.createGroup();
            },
            enterConfig.descriptionKey,
            modifiers,
            true,
        );
    }

    componentWillUnmount() {
        if (!this.unsubscribeCTRLEnter) {
            return;
        }
        this.unsubscribeCTRLEnter();
    }

    render() {
        return (
            <NewChatPage
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...this.props}
                isGroupChat
                ref={el => this.newChatPage = el}
            />
        );
    }
}

export default NewGroupPage;
