import CONST from '@src/CONST';

export default function fetchImage(source: string, authToken: string) {
    return fetch(source, {
        headers: {
            [CONST.CHAT_ATTACHMENT_TOKEN_KEY]: authToken,
        },
    })
        .then((res) => res.blob())
        .then((blob) => {
            return URL.createObjectURL(blob);
        });
}
