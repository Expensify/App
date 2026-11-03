/*
 * Writes pre-formatted log lines directly to rsyslog over the systemd-journald AF_UNIX SOCK_DGRAM
 * socket, the same way Web-Expensify's Log.php (_writeRsyslog) and Bedrock's libstuff.cpp
 * (SSyslogSocketDirect) do.
 *
 * Bun has no built-in AF_UNIX SOCK_DGRAM client, so we use bun:ffi to call libc's socket/sendto/close syscalls directly.
 */
import {dlopen, suffix} from 'bun:ffi';

const DEFAULT_SOCKET_PATH = '/run/systemd/journal/syslog';

// POSIX constants passed to socket() / sendto()
const AF_UNIX = 1;
const SOCK_DGRAM = 2;
// sendto() MSG_DONTWAIT: return immediately with EAGAIN if the send would block (e.g. syslog
// receive queue full). Linux: 0x40, Darwin: 0x80. Production targets Linux; macOS rarely has the
// journal socket. Named for the positive behavior rather than the POSIX macro (DONTWAIT) so we
// satisfy rulesdir/no-negated-variables.
const SENDTO_NONBLOCK = process.platform === 'darwin' ? 0x80 : 0x40;

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
// Returns false if dlopen, socket(), or path encoding fails (caller writes to stderr instead).
function ensureSocket(): boolean {
    if (socketFd !== -1) {
        return true;
    }

    try {
        libc ??= loadLibc();
        const fd = libc.symbols.socket(AF_UNIX, SOCK_DGRAM, 0);

        if (fd < 0) {
            return false;
        }

        socketFd = fd;
        sockaddr = buildSockaddrUn(getSocketPath());
        return true;
    } catch {
        libc = undefined;
        socketFd = -1;
        sockaddr = undefined;
        return false;
    }
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
    // MSG_DONTWAIT so a full syslog receive queue cannot stall chart rendering; on EAGAIN (or any
    // other send failure) fall back to stderr. Bun passes `message` as the buf pointer and
    // `sockaddr` as dest_addr.
    try {
        const bytesSent = libc.symbols.sendto(socketFd, message, message.length, SENDTO_NONBLOCK, sockaddr, sockaddr.length);

        if (bytesSent < 0) {
            // Keep the fd on backpressure (EAGAIN); only reset after a hard/FFI failure below so the
            // next write can reopen. Temporary full queues should not thrash socket()/close().
            process.stderr.write(`${line}\n`);
            return false;
        }

        return true;
    } catch {
        try {
            libc.symbols.close(socketFd);
        } catch {
            // Ignore close failures while already in the error path.
        }
        socketFd = -1;
        process.stderr.write(`${line}\n`);
        return false;
    }
}

export default writeRsyslog;
