import React from 'react';
import he from 'he';

function encodeHTML(html: string): string {
    return he.encode(html);
}

export default encodeHTML;