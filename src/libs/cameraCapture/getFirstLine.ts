// On Android a VisionCamera error message is the whole Java stack trace.
function getFirstLine(message: string): string {
    return message.split('\n').at(0)?.trim() ?? '';
}

export default getFirstLine;
