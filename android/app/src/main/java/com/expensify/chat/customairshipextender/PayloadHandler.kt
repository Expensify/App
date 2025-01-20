package com.expensify.chat.customairshipextender

import android.os.Build
import androidx.annotation.RequiresApi
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.nio.charset.StandardCharsets
import java.util.Base64
import java.util.zip.GZIPInputStream

object PayloadHandler {
    private const val BUFFER_SIZE = 1024
    private val GZIP_MAGIC = byteArrayOf(0x1f.toByte(), 0x8b.toByte())

    @JvmStatic
    @RequiresApi(api = Build.VERSION_CODES.O)
    fun processPayload(payloadString: String): String =
            runCatching {
                        val decoded = Base64.getDecoder().decode(payloadString)
                        if (!isGzipped(decoded)) error("Input not gzipped")
                        return decompressGzip(decoded)
                    }
                    .getOrDefault(payloadString)

    private fun isGzipped(decoded: ByteArray) =
            decoded[0] == GZIP_MAGIC[0] && decoded[1] == GZIP_MAGIC[1]

    private fun decompressGzip(compressed: ByteArray): String {
        ByteArrayInputStream(compressed).use { bis ->
            GZIPInputStream(bis).use { gis ->
                ByteArrayOutputStream().use { output ->
                    val buffer = ByteArray(BUFFER_SIZE)
                    var len: Int
                    while (gis.read(buffer).also { len = it } > 0) {
                        output.write(buffer, 0, len)
                    }

                    return output.toString(StandardCharsets.UTF_8.name())
                }
            }
        }
    }
}
