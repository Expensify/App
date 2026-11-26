/**
 * Reads and writes zip archives, which is what a .lottie file is. It only covers what our assets need: entries that are
 * stored or deflated, without encryption or ZIP64. The layout of each record comes from the ZIP specification
 * (https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT, sections 4.3.7, 4.3.12 and 4.3.16).
 */
import * as zlib from 'zlib';

type ZipEntry = {
    /** Path of the file inside the archive */
    name: string;
    data: Buffer;
};

const LOCAL_FILE_HEADER = {
    SIGNATURE: 0x04034b50,
    LENGTH: 30,
    VERSION_NEEDED: 4,
    FLAGS: 6,
    METHOD: 8,
    DATE: 12,
    CRC32: 14,
    COMPRESSED_SIZE: 18,
    UNCOMPRESSED_SIZE: 22,
    NAME_LENGTH: 26,
    EXTRA_LENGTH: 28,
} as const;

const CENTRAL_FILE_HEADER = {
    SIGNATURE: 0x02014b50,
    LENGTH: 46,
    VERSION_MADE_BY: 4,
    VERSION_NEEDED: 6,
    FLAGS: 8,
    METHOD: 10,
    DATE: 14,
    CRC32: 16,
    COMPRESSED_SIZE: 20,
    UNCOMPRESSED_SIZE: 24,
    NAME_LENGTH: 28,
    EXTRA_LENGTH: 30,
    COMMENT_LENGTH: 32,
    LOCAL_HEADER_OFFSET: 42,
} as const;

const END_OF_CENTRAL_DIRECTORY = {
    SIGNATURE: 0x06054b50,
    LENGTH: 22,
    DISK_ENTRY_COUNT: 8,
    ENTRY_COUNT: 10,
    CENTRAL_DIRECTORY_SIZE: 12,
    CENTRAL_DIRECTORY_OFFSET: 16,
} as const;

const COMPRESSION_METHOD = {
    STORED: 0,
    DEFLATED: 8,
} as const;

// Version 2.0 of the format, the first one with deflate
const ZIP_VERSION = 20;

// Bit 11 of the flags says that the names are encoded in UTF-8
const UTF8_NAMES_FLAG = 0x0800;

// January 1st 1980 in the MS-DOS format, the earliest date an entry can have. Every entry gets it so that the same content always gives the same archive.
const EARLIEST_DOS_DATE = 0x0021;

// The assets are compressed once and shipped with the app, so they get the highest level
const COMPRESSION_LEVEL = 9;

// Every record starts with a signature of 32 bits
const SIGNATURE_LENGTH = 4;

function createSignature(signature: number): Buffer {
    const buffer = Buffer.alloc(SIGNATURE_LENGTH);
    buffer.writeUInt32LE(signature);
    return buffer;
}

function read(archive: Buffer): ZipEntry[] {
    // The archive ends with this record, which says where the list of entries is
    const endOffset = archive.lastIndexOf(createSignature(END_OF_CENTRAL_DIRECTORY.SIGNATURE));
    if (endOffset === -1) {
        throw new Error('Not a zip archive');
    }

    const entries: ZipEntry[] = [];
    const entryCount = archive.readUInt16LE(endOffset + END_OF_CENTRAL_DIRECTORY.ENTRY_COUNT);
    let offset = archive.readUInt32LE(endOffset + END_OF_CENTRAL_DIRECTORY.CENTRAL_DIRECTORY_OFFSET);
    for (let index = 0; index < entryCount; index++) {
        const method = archive.readUInt16LE(offset + CENTRAL_FILE_HEADER.METHOD);
        const compressedSize = archive.readUInt32LE(offset + CENTRAL_FILE_HEADER.COMPRESSED_SIZE);
        const nameLength = archive.readUInt16LE(offset + CENTRAL_FILE_HEADER.NAME_LENGTH);
        const name = archive.toString('utf8', offset + CENTRAL_FILE_HEADER.LENGTH, offset + CENTRAL_FILE_HEADER.LENGTH + nameLength);
        if (method !== COMPRESSION_METHOD.STORED && method !== COMPRESSION_METHOD.DEFLATED) {
            throw new Error(`Unsupported compression method ${method} for ${name}`);
        }

        // The name and the extra field of the local header have their own lengths, which can differ from the central ones
        const localOffset = archive.readUInt32LE(offset + CENTRAL_FILE_HEADER.LOCAL_HEADER_OFFSET);
        const dataOffset =
            localOffset + LOCAL_FILE_HEADER.LENGTH + archive.readUInt16LE(localOffset + LOCAL_FILE_HEADER.NAME_LENGTH) + archive.readUInt16LE(localOffset + LOCAL_FILE_HEADER.EXTRA_LENGTH);
        const compressedData = archive.subarray(dataOffset, dataOffset + compressedSize);
        entries.push({name, data: method === COMPRESSION_METHOD.STORED ? Buffer.from(compressedData) : zlib.inflateRawSync(compressedData)});

        offset +=
            CENTRAL_FILE_HEADER.LENGTH + nameLength + archive.readUInt16LE(offset + CENTRAL_FILE_HEADER.EXTRA_LENGTH) + archive.readUInt16LE(offset + CENTRAL_FILE_HEADER.COMMENT_LENGTH);
    }
    return entries;
}

function write(entries: ZipEntry[]): Buffer {
    const localRecords: Buffer[] = [];
    const centralRecords: Buffer[] = [];
    let localOffset = 0;
    for (const entry of entries) {
        const name = Buffer.from(entry.name, 'utf8');
        const compressedData = zlib.deflateRawSync(entry.data, {level: COMPRESSION_LEVEL});
        const checksum = zlib.crc32(entry.data);

        const localHeader = Buffer.alloc(LOCAL_FILE_HEADER.LENGTH);
        localHeader.writeUInt32LE(LOCAL_FILE_HEADER.SIGNATURE);
        localHeader.writeUInt16LE(ZIP_VERSION, LOCAL_FILE_HEADER.VERSION_NEEDED);
        localHeader.writeUInt16LE(UTF8_NAMES_FLAG, LOCAL_FILE_HEADER.FLAGS);
        localHeader.writeUInt16LE(COMPRESSION_METHOD.DEFLATED, LOCAL_FILE_HEADER.METHOD);
        localHeader.writeUInt16LE(EARLIEST_DOS_DATE, LOCAL_FILE_HEADER.DATE);
        localHeader.writeUInt32LE(checksum, LOCAL_FILE_HEADER.CRC32);
        localHeader.writeUInt32LE(compressedData.length, LOCAL_FILE_HEADER.COMPRESSED_SIZE);
        localHeader.writeUInt32LE(entry.data.length, LOCAL_FILE_HEADER.UNCOMPRESSED_SIZE);
        localHeader.writeUInt16LE(name.length, LOCAL_FILE_HEADER.NAME_LENGTH);

        const centralHeader = Buffer.alloc(CENTRAL_FILE_HEADER.LENGTH);
        centralHeader.writeUInt32LE(CENTRAL_FILE_HEADER.SIGNATURE);
        centralHeader.writeUInt16LE(ZIP_VERSION, CENTRAL_FILE_HEADER.VERSION_MADE_BY);
        centralHeader.writeUInt16LE(ZIP_VERSION, CENTRAL_FILE_HEADER.VERSION_NEEDED);
        centralHeader.writeUInt16LE(UTF8_NAMES_FLAG, CENTRAL_FILE_HEADER.FLAGS);
        centralHeader.writeUInt16LE(COMPRESSION_METHOD.DEFLATED, CENTRAL_FILE_HEADER.METHOD);
        centralHeader.writeUInt16LE(EARLIEST_DOS_DATE, CENTRAL_FILE_HEADER.DATE);
        centralHeader.writeUInt32LE(checksum, CENTRAL_FILE_HEADER.CRC32);
        centralHeader.writeUInt32LE(compressedData.length, CENTRAL_FILE_HEADER.COMPRESSED_SIZE);
        centralHeader.writeUInt32LE(entry.data.length, CENTRAL_FILE_HEADER.UNCOMPRESSED_SIZE);
        centralHeader.writeUInt16LE(name.length, CENTRAL_FILE_HEADER.NAME_LENGTH);
        centralHeader.writeUInt32LE(localOffset, CENTRAL_FILE_HEADER.LOCAL_HEADER_OFFSET);

        localRecords.push(localHeader, name, compressedData);
        centralRecords.push(centralHeader, name);
        localOffset += localHeader.length + name.length + compressedData.length;
    }

    const centralDirectory = Buffer.concat(centralRecords);
    const end = Buffer.alloc(END_OF_CENTRAL_DIRECTORY.LENGTH);
    end.writeUInt32LE(END_OF_CENTRAL_DIRECTORY.SIGNATURE);
    end.writeUInt16LE(entries.length, END_OF_CENTRAL_DIRECTORY.DISK_ENTRY_COUNT);
    end.writeUInt16LE(entries.length, END_OF_CENTRAL_DIRECTORY.ENTRY_COUNT);
    end.writeUInt32LE(centralDirectory.length, END_OF_CENTRAL_DIRECTORY.CENTRAL_DIRECTORY_SIZE);
    end.writeUInt32LE(localOffset, END_OF_CENTRAL_DIRECTORY.CENTRAL_DIRECTORY_OFFSET);
    return Buffer.concat([...localRecords, centralDirectory, end]);
}

const ZipUtils = {read, write};

export default ZipUtils;
export type {ZipEntry};
