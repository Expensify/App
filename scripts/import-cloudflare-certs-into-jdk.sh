#!/bin/bash
#
# Imports the Cloudflare WARP Gateway Root CA certificate into all Java installations.
# This is necessary because Cloudflare Zero Trust WARP acts as a man-in-the-middle proxy,
# intercepting SSL connections with its own certificate. Without importing this certificate,
# Gradle and other Java tools fail with SSL handshake errors when downloading dependencies.
# This script automatically finds all JDKs, stops Gradle daemons, and imports the certificate.

set -eu

# Get the directory where this script lives
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly SCRIPT_DIR

# Certificate is in the Expensidev repo (assumed to betwo levels up from scripts directory)
EXPENSIDEV_DIR="$(dirname "$(dirname "${SCRIPT_DIR}")")"
readonly EXPENSIDEV_DIR
readonly CERT_FILE="${EXPENSIDEV_DIR}/config/ssl/cloudflare-ca.pem"

source "${SCRIPT_DIR}/shellUtils.sh"

readonly CERT_ALIAS="cloudflare-gateway-root"
readonly KEYSTORE_PASSWORD="changeit"

# Function to check if Cloudflare WARP certificate is imported into default JDK
# Returns 0 if certificate is imported, 1 otherwise
function is_cloudflare_cert_imported() {
    if ! command -v keytool &>/dev/null; then
        return 1
    fi

    local JAVA_HOME_PATH
    JAVA_HOME_PATH=$(/usr/libexec/java_home 2>/dev/null) || return 1

    keytool -list -keystore "${JAVA_HOME_PATH}/lib/security/cacerts" \
        -storepass "${KEYSTORE_PASSWORD}" -alias "${CERT_ALIAS}" &>/dev/null
}

function stop_gradle_daemons() {
    title "Step 1: Stopping Gradle daemons"
    if pgrep -f "GradleDaemon" &>/dev/null; then
        pkill -f "GradleDaemon" &>/dev/null || true
        success "Gradle daemons stopped"
    else
        info "No Gradle daemons running"
    fi
}

function find_java_installations() {
    title "Step 2: Finding all Java installations"

    local JAVA_HOMES
    JAVA_HOMES=$(/usr/libexec/java_home -V 2>&1 | grep -E "^\s+[0-9]" | awk -F'"' '{print $4}')

    if [[ -z "${JAVA_HOMES}" ]]; then
        error "No Java installations found"
        exit 1
    fi

    local JDK_COUNT
    JDK_COUNT=$(echo "${JAVA_HOMES}" | wc -l | tr -d ' ')
    success "Found ${JDK_COUNT} Java installation(s)"

    echo "${JAVA_HOMES}"
}

function import_certificates() {
    local JAVA_HOMES="$1"

    title "Step 3: Importing certificate into Java keystores"

    local SUCCESS_COUNT=0
    local FAIL_COUNT=0

    local JAVA_HOME_PATH
    while IFS= read -r JAVA_HOME_PATH; do
        if [[ -z "${JAVA_HOME_PATH}" ]]; then
            continue
        fi

        # Get Java version for display
        local VERSION
        VERSION=$("${JAVA_HOME_PATH}/bin/java" -version 2>&1 | head -n 1 | awk -F'"' '{print $2}')
        echo
        info "Processing: Java ${VERSION}"
        info "Location: ${JAVA_HOME_PATH}"

        # Determine keystore location (Java 8 has a different path)
        local KEYSTORE
        if [[ -f "${JAVA_HOME_PATH}/lib/security/cacerts" ]]; then
            KEYSTORE="${JAVA_HOME_PATH}/lib/security/cacerts"
        elif [[ -f "${JAVA_HOME_PATH}/jre/lib/security/cacerts" ]]; then
            KEYSTORE="${JAVA_HOME_PATH}/jre/lib/security/cacerts"
        else
            info "Warning: Could not find cacerts file, skipping"
            ((FAIL_COUNT++))
            continue
        fi

        # Check if certificate already exists
        if keytool -list -keystore "${KEYSTORE}" -storepass "${KEYSTORE_PASSWORD}" \
           -alias "${CERT_ALIAS}" &>/dev/null; then
            info "Certificate already exists, removing old one..."
            keytool -delete -alias "${CERT_ALIAS}" \
                    -keystore "${KEYSTORE}" \
                    -storepass "${KEYSTORE_PASSWORD}" \
                    &>/dev/null || true
        fi

        # Import the certificate
        if keytool -import -trustcacerts \
                   -alias "${CERT_ALIAS}" \
                   -file "${CERT_FILE}" \
                   -keystore "${KEYSTORE}" \
                   -storepass "${KEYSTORE_PASSWORD}" \
                   -noprompt &>/dev/null; then
            success "Certificate imported successfully"
            ((SUCCESS_COUNT++))
        else
            error "Failed to import certificate"
            ((FAIL_COUNT++))
        fi
    done <<< "${JAVA_HOMES}"

    echo "${SUCCESS_COUNT}"
    echo "${FAIL_COUNT}"
}

function print_summary() {
    local SUCCESS_COUNT="$1"
    local FAIL_COUNT="$2"

    title "Summary"

    success "Successfully imported: ${SUCCESS_COUNT}"
    if [[ "${FAIL_COUNT}" -gt 0 ]]; then
        error "Failed: ${FAIL_COUNT}"
    fi

    echo
    if [[ "${SUCCESS_COUNT}" -gt 0 ]]; then
        success "Certificate import complete!"
        echo
        info "The Cloudflare WARP certificate has been imported into your"
        info "Java keystores. You can now build Android apps with WARP enabled."
        echo
        info "Note: Gradle daemon will automatically use the updated certificates"
        info "when it restarts on your next build."
        echo
        info "To verify the certificate was imported, run:"
        info "  keytool -list -keystore \$JAVA_HOME/lib/security/cacerts \\"
        info "    -storepass changeit -alias ${CERT_ALIAS}"
        exit 0
    else
        error "No certificates were imported successfully"
        exit 1
    fi
}

function main() {
    # Early exit if certs are already imported
    if is_cloudflare_cert_imported; then
        success "Cloudflare certificates are already imported into JDK."
        exit 0
    fi

    # At this point, certs need to be imported
    # If not running with sudo, re-exec with sudo (will prompt for password)
    if [[ "${EUID}" -ne 0 ]]; then
        info "Importing certificates requires sudo access."
        exec sudo "$0" "$@"
    fi

    # At this point, we're running with sudo and certs need to be imported
    title "Cloudflare WARP Certificate Importer"

    # Verify certificate file exists
    if [[ ! -f "${CERT_FILE}" ]]; then
        error "Cloudflare certificate not found at: ${CERT_FILE}"
        error "Make sure you have the Expensidev repository cloned."
        exit 1
    fi

    stop_gradle_daemons

    local JAVA_HOMES
    JAVA_HOMES=$(find_java_installations)

    local IMPORT_RESULTS
    IMPORT_RESULTS=$(import_certificates "${JAVA_HOMES}")

    local SUCCESS_COUNT
    local FAIL_COUNT
    SUCCESS_COUNT=$(echo "${IMPORT_RESULTS}" | head -n 1)
    FAIL_COUNT=$(echo "${IMPORT_RESULTS}" | tail -n 1)

    print_summary "${SUCCESS_COUNT}" "${FAIL_COUNT}"
}

main "$@"
