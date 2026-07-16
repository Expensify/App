/*
 * Writes pre-formatted log lines directly to rsyslog over the systemd-journald AF_UNIX SOCK_DGRAM
 * socket, the same way Web-Expensify's Log.php (_writeRsyslog) and Bedrock's libstuff.cpp
 * (SSyslogSocketDirect) do.
 *
 * Bun has no built-in AF_UNIX SOCK_DGRAM client, so we use bun:ffi to call libc's socket/sendto/close syscalls directly.
 */
import {dlopen, suffix} from 'bun:ffi';

const DEFAULT_SOCKET_PATH = '/run/systemd/journal/syslog';

// POSIX constants passed to socket()
const AF_UNIX = 1;
const SOCK_DGRAM = 2;

// Linux struct sockaddr_un layout: sa_family_t (2 bytes) + char sun_path[108]. We build this byte
// array manually because bun:ffi has no struct helper for the address type sendto() expects.
const SUN_PATH_MAX = 108;

function shouldForceStderr(): boolean {
    return process.env.VCR_LOG_DESTINATION === 'stderr';
}

function getSocketPath(): string {
    return process.env.RSYSLOG_SOCKET_PATH ?? DEFAULT_SOCKET_PATH;
}

// Load libc once and bind the three syscalls we need. dlopen returns callable wrappers that
// marshal JavaScript values (numbers, Buffers) into the C ABI and read back the return value.
function loadLibc() {
    // libc.so.6 is the real runtime library on Linux ("libc.so" is normally only present via -dev
    // packages); libc.dylib is a symlink to libSystem on macOS, so `libc.${suffix}` is fine there.
    const libcPath = process.platform === 'linux' ? 'libc.so.6' : `libc.${suffix}`;

    return dlopen(libcPath, {
        // int socket(int domain, int type, int protocol);
        socket: {args: ['i32', 'i32', 'i32'], returns: 'i32'},
        // ssize_t sendto(int sockfd, const void *buf, size_t len, int flags, const struct sockaddr *dest_addr, socklen_t addrlen);
        sendto: {args: ['i32', 'ptr', 'u64', 'i32', 'ptr', 'u32'], returns: 'i32'},
        // int close(int fd);
        close: {args: ['i32'], returns: 'i32'},
    });
}

type Libc = ReturnType<typeof loadLibc>;

let libc: Libc | undefined;
// socketFd === -1 means "not open or previously failed and closed".
let socketFd = -1;
let sockaddr: Uint8Array | undefined;

function buildSockaddrUn(path: string): Uint8Array {
    const pathBytes = Buffer.from(path, 'utf8');

    if (pathBytes.length >= SUN_PATH_MAX) {
        throw new Error(`Rsyslog socket path is too long for sockaddr_un: ${path}`);
    }

    const addr = new Uint8Array(2 + SUN_PATH_MAX);
    // First two bytes are the address family (AF_UNIX); the socket path follows at offset 2.
    addr[0] = AF_UNIX;
    addr.set(pathBytes, 2);
    return addr;
}

// Lazily open the socket on first log write.
// Returns false if dlopen, socket(), or path encoding fails.
function ensureSocket(): boolean {
    if (socketFd !== -1) {
        return true;
    }

    libc ??= loadLibc();
    const fd = libc.symbols.socket(AF_UNIX, SOCK_DGRAM, 0);

    if (fd < 0) {
        return false;
    }

    socketFd = fd;
    sockaddr = buildSockaddrUn(getSocketPath());
    return true;
}

/**
 * Sends a single, already-formatted log line to rsyslog. Returns whether the socket send
 * succeeded; on failure (or when `VCR_LOG_DESTINATION=stderr` is set) the line is written to
 * stderr instead.
 */
function writeRsyslog(line: string): boolean {
    if (shouldForceStderr() || !ensureSocket() || !sockaddr || !libc) {
        process.stderr.write(`${line}\n`);
        return false;
    }

    const message = Buffer.from(line, 'utf8');
    // flags=0: no MSG_DONTWAIT etc. Bun passes `message` as the buf pointer and `sockaddr` as dest_addr.
    const bytesSent = libc.symbols.sendto(socketFd, message, message.length, 0, sockaddr, sockaddr.length);

    if (bytesSent < 0) {
        // Drop the fd so the next write attempts a fresh socket (path or journald may have recovered).
        libc.symbols.close(socketFd);
        socketFd = -1;
        process.stderr.write(`${line}\n`);
        return false;
    }

    return true;
}

export default writeRsyslog;
