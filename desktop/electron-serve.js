/* eslint-disable rulesdir/no-negated-variables */
/* eslint-disable no-param-reassign */
/* eslint-disable @lwc/lwc/no-async-await */

/**
 * This file is a modified version of the electron-serve package.
 * We keep the same interface, but instead of file protocol we use buffer protocol (with support of JS self profiling).
 */
const {app, protocol, session} = require('electron');
const path = require('path');
const fs = require('fs');

const FILE_NOT_FOUND = -6;

const getPath = async (filePath) => {
    try {
        const result = await fs.promises.stat(filePath);

        if (result.isFile()) {
            return filePath;
        }

        if (result.isDirectory()) {
            return getPath(path.join(filePath, 'index.html'));
        }
    } catch {
        return null;
    }
};

export default function electronServe(options) {
    options = {
        isCorsEnabled: true,
        scheme: 'app',
        hostname: '-',
        file: 'index',
        ...options,
    };

    if (!options.directory) {
        throw new Error('The `directory` option is required');
    }

    options.directory = path.resolve(app.getAppPath(), options.directory);

    const handler = async (request, callback) => {
        const filePath = path.join(options.directory, decodeURIComponent(new URL(request.url).pathname));
        const resolvedPath = (await getPath(filePath)) || path.join(options.directory, `${options.file}.html`);

        try {
            const data = await fs.promises.readFile(resolvedPath);
            callback({
                mimeType: 'text/html',
                data: Buffer.from(data),
                headers: {
                    'Document-Policy': 'js-profiling',
                },
            });
        } catch (error) {
            callback({error: FILE_NOT_FOUND});
        }
    };

    protocol.registerSchemesAsPrivileged([
        {
            scheme: options.scheme,
            privileges: {
                standard: true,
                secure: true,
                allowServiceWorkers: true,
                supportFetchAPI: true,
                corsEnabled: options.isCorsEnabled,
            },
        },
    ]);

    app.on('ready', () => {
        const partitionSession = options.partition ? session.fromPartition(options.partition) : session.defaultSession;

        partitionSession.protocol.registerBufferProtocol(options.scheme, handler);
    });

    return async (window_, searchParameters) => {
        const queryString = searchParameters ? `?${new URLSearchParams(searchParameters).toString()}` : '';
        await window_.loadURL(`${options.scheme}://${options.hostname}${queryString}`);
    };
}
