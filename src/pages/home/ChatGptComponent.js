import {useChatGpt, ChatGptError} from 'react-native-chatgpt';

// eslint-disable-next-line rulesdir/no-inline-named-export, import/prefer-default-export
export function ChatGptComponent({message}) {
    const {sendMessage} = useChatGpt();

    // eslint-disable-next-line @lwc/lwc/no-async-await
    const handleSendMessage = async () => {
        try {
            const result = await sendMessage(message);
            console.log('Chat GPT replied:', result.message);
        } catch (error) {
            if (error instanceof ChatGptError) {
                console.error(error);
            }
        }
    };

    handleSendMessage();
}
