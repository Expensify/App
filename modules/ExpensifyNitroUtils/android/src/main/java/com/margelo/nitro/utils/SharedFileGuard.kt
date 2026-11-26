package com.margelo.nitro.utils

import java.io.File
import java.io.IOException

/** Keeps share reads inside the folder the host intent handlers copy shared files into. */
object SharedFileGuard {
    /** Returns the file only when it is a readable regular file inside [baseDir], after resolving symlinks and `..` segments. */
    fun resolveInside(baseDir: File, path: String): File? {
        if (path.isEmpty()) {
            return null
        }

        return try {
            val basePath = baseDir.canonicalPath + File.separator
            val file = File(path).canonicalFile
            if (file.path.startsWith(basePath) && file.isFile && file.canRead()) file else null
        } catch (e: IOException) {
            null
        }
    }
}
