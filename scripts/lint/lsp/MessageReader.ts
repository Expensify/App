/**
 * Reads and writes the `Content-Length` framed JSON-RPC messages that language servers exchange over stdio.
 */
import type {JSONObject} from './LSPUtils';

import LSPUtils from './LSPUtils';

const HEADER_SEPARATOR = '\r\n\r\n';
const CONTENT_LENGTH_HEADER = /Content-Length:\s*(\d+)/i;

function encodeMessage(message: JSONObject): Buffer {
    const body = JSON.stringify(message);
    return Buffer.from(`Content-Length: ${Buffer.byteLength(body)}${HEADER_SEPARATOR}${body}`);
}

/** Splits a byte stream into messages. Chunks can end anywhere, so partial messages wait for the next push. */
class MessageReader {
    private buffer = Buffer.alloc(0);

    constructor(private readonly onMessage: (message: JSONObject) => void) {}

    push(chunk: Uint8Array): void {
        this.buffer = Buffer.concat([this.buffer, chunk]);
        while (true) {
            const headerEnd = this.buffer.indexOf(HEADER_SEPARATOR);
            if (headerEnd < 0) {
                return;
            }
            const length = Number(CONTENT_LENGTH_HEADER.exec(this.buffer.subarray(0, headerEnd).toString('ascii'))?.at(1));
            if (!Number.isInteger(length)) {
                throw new Error('Language server message has no Content-Length header');
            }
            // Content-Length counts bytes, not characters, so the body is sliced before decoding.
            const bodyStart = headerEnd + HEADER_SEPARATOR.length;
            if (this.buffer.length < bodyStart + length) {
                return;
            }
            const body: unknown = JSON.parse(this.buffer.subarray(bodyStart, bodyStart + length).toString('utf8'));
            this.buffer = this.buffer.subarray(bodyStart + length);
            if (LSPUtils.isRecord(body)) {
                this.onMessage(body);
            }
        }
    }
}

export default MessageReader;
export {encodeMessage};
