package com.expensify.chat.customairshipextender

import android.util.Base64
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.util.zip.GZIPInputStream

class PayloadHandler {
    private val BUFFER_SIZE = 4096
    private val GZIP_MAGIC = byteArrayOf(0x1f.toByte(), 0x8b.toByte())

    fun processPayload(payloadString: String): String =
        runCatching {
            val decoded = Base64.decode(payloadString, Base64.DEFAULT)
            if (!isGzipped(decoded)) error("Input not gzipped")
            return decompressGzip(decoded)
        }.getOrDefault(payloadString)

    private fun isGzipped(decoded: ByteArray) =
        decoded.size >= 2 && decoded[0] == GZIP_MAGIC[0] && decoded[1] == GZIP_MAGIC[1]

    private fun decompressGzip(compressed: ByteArray): String {
        ByteArrayInputStream(compressed).use { bis ->
            GZIPInputStream(bis).use { gis ->
                ByteArrayOutputStream().use { output ->
                    val buffer = ByteArray(BUFFER_SIZE)
                    var len: Int
                    while (gis.read(buffer).also { len = it } > 0) {
                        output.write(buffer, 0, len)
                    }

                    return output.toString("UTF-8")
                }
            }
        }
    }
}
