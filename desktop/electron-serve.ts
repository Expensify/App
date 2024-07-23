/* eslint-disable @typescript-eslint/no-misused-promises */

/* eslint-disable rulesdir/no-negated-variables */

/* eslint-disable @lwc/lwc/no-async-await */

/**
 * This file is a modified version of the electron-serve package.
 * We keep the same interface, but instead of file protocol we use buffer protocol (with support of JS self profiling).
 */
import type {BrowserWindow, Protocol} from 'electron';
import {app, protocol, session} from 'electron';
import fs from 'fs';
import path from 'path';

type RegisterBufferProtocol = Protocol['registerBufferProtocol'];
type HandlerType = Parameters<RegisterBufferProtocol>[1];
type Optional<T> = T | null | undefined;

const FILE_NOT_FOUND = -6;

const getPath = async (filePath: string): Promise<Optional<string>> => {
    try {
        const result = await fs.promises.stat(filePath);

        if (result.isFile()) {
            return filePath;
        }

        if (result.isDirectory()) {
            // eslint-disable-next-line @typescript-eslint/return-await
            return getPath(path.join(filePath, 'index.html'));
        }
    } catch {
        return null;
    }
};

type ServeOptions = {
    directory: string;
    isCorsEnabled?: boolean;
    scheme?: string;
    hostname?: string;
    file?: string;
    partition?: string;
};

export default function electronServe(options: ServeOptions) {
    const mandatoryOptions = {
        isCorsEnabled: true,
        scheme: 'app',
        hostname: '-',
        file: 'index',
        ...options,
    };

    if (!mandatoryOptions.directory) {
        throw new Error('The `directory` option is required');
    }

    mandatoryOptions.directory = path.resolve(app.getAppPath(), mandatoryOptions.directory);

    const handler: HandlerType = async (request, callback) => {
        const filePath = path.join(mandatoryOptions.directory, decodeURIComponent(new URL(request.url).pathname));
        const resolvedPath = (await getPath(filePath)) ?? path.join(mandatoryOptions.directory, `${mandatoryOptions.file}.html`);

        try {
            const data = await fs.promises.readFile(resolvedPath);
            callback({
                mimeType: 'text/html',
                data: Buffer.from(data),
                headers: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'Document-Policy': 'js-profiling',
                },
            });
        } catch (error) {
            callback({error: FILE_NOT_FOUND});
        }
    };

    protocol.registerSchemesAsPrivileged([
        {
            scheme: mandatoryOptions.scheme,
            privileges: {
                standard: true,
                secure: true,
                allowServiceWorkers: true,
                supportFetchAPI: true,
                corsEnabled: mandatoryOptions.isCorsEnabled,
            },
        },
    ]);

    app.on('ready', () => {
        const partitionSession = mandatoryOptions.partition ? session.fromPartition(mandatoryOptions.partition) : session.defaultSession;

        partitionSession.protocol.registerBufferProtocol(mandatoryOptions.scheme, handler);
    });

    // eslint-disable-next-line @typescript-eslint/naming-convention
    return async (window_: BrowserWindow, searchParameters?: URLSearchParams) => {
        const queryString = searchParameters ? `?${new URLSearchParams(searchParameters).toString()}` : '';
        await window_.loadURL(`${mandatoryOptions.scheme}://${mandatoryOptions.hostname}${queryString}`);
    };
}
