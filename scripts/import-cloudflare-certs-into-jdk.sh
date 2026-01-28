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

source "${SCRIPT_DIR}/shellUtils.sh"

# Certificate is in the Expensidev repo (two levels up from scripts directory)
EXPENSIDEV_DIR="$(dirname "$(dirname "${SCRIPT_DIR}")")"
readonly EXPENSIDEV_DIR
readonly CERT_FILE="${EXPENSIDEV_DIR}/config/ssl/cloudflare-ca.pem"

# Global constants
readonly CERT_ALIAS="cloudflare-gateway-root"
readonly KEYSTORE_PASSWORD="${JAVA_KEYSTORE_PASSWORD:-changeit}"

# Global variables
JAVA_HOMES=""
JAVA_HOME_PATH=""
KEYSTORE=""
SUCCESS_COUNT=0
FAIL_COUNT=0

# Function to set the KEYSTORE global variable for the current JAVA_HOME_PATH
# Returns 0 if found, 1 if not found
function get_keystore_path() {
    if [[ -f "${JAVA_HOME_PATH}/lib/security/cacerts" ]]; then
        KEYSTORE="${JAVA_HOME_PATH}/lib/security/cacerts"
        return 0
    elif [[ -f "${JAVA_HOME_PATH}/jre/lib/security/cacerts" ]]; then
        KEYSTORE="${JAVA_HOME_PATH}/jre/lib/security/cacerts"
        return 0
    fi
    return 1
}

# Function to check if Cloudflare WARP certificate is imported into default JDK
# Returns 0 if certificate is imported, 1 otherwise
function is_cloudflare_cert_imported() {
    if ! command -v keytool &>/dev/null; then
        return 1
    fi

    JAVA_HOME_PATH=$(/usr/libexec/java_home 2>/dev/null) || return 1

    if ! get_keystore_path; then
        return 1
    fi

    keytool -list -keystore "${KEYSTORE}" \
        -storepass "${KEYSTORE_PASSWORD}" -alias "${CERT_ALIAS}" &>/dev/null
}

function stop_gradle_daemons() {
    if pgrep -f "GradleDaemon" &>/dev/null; then
        pkill -f "GradleDaemon" &>/dev/null || true
        success "Gradle daemons stopped"
    else
        echo "No Gradle daemons running"
    fi
}

function find_java_installations() {
    JAVA_HOMES=$(/usr/libexec/java_home -V 2>&1 | grep -E "^\s+[0-9]" | awk '{print $NF}')

    if [[ -z "${JAVA_HOMES}" ]]; then
        error "No Java installations found"
        exit 1
    fi

    local JDK_COUNT
    JDK_COUNT=$(echo "${JAVA_HOMES}" | wc -l | tr -d ' ')
    success "Found ${JDK_COUNT} Java installation(s)"
}

function import_certificates() {
    while IFS= read -r JAVA_HOME_PATH; do
        if [[ -z "${JAVA_HOME_PATH}" ]]; then
            continue
        fi

        # Get Java version for display
        local VERSION
        VERSION=$("${JAVA_HOME_PATH}/bin/java" -version 2>&1 | head -n 1 | awk -F'"' '{print $2}')
        echo
        echo "Processing: Java ${VERSION}"
        echo "  Location: ${JAVA_HOME_PATH}"

        # Get keystore location
        if ! get_keystore_path; then
            error "Could not find cacerts file\n  Tried: ${JAVA_HOME_PATH}/lib/security/cacerts\n  Tried: ${JAVA_HOME_PATH}/jre/lib/security/cacerts"
            ((FAIL_COUNT++))
            continue
        fi

        # Check if certificate already exists
        if keytool -list -keystore "${KEYSTORE}" -storepass "${KEYSTORE_PASSWORD}" \
           -alias "${CERT_ALIAS}" &>/dev/null; then
            echo "  Certificate already exists, removing old one..."
            keytool -delete -keystore "${KEYSTORE}" -alias "${CERT_ALIAS}" \
                    -storepass "${KEYSTORE_PASSWORD}" \
                    &>/dev/null || true
        fi

        # Import the certificate
        if keytool -import -trustcacerts -keystore "${KEYSTORE}" \
                   -alias "${CERT_ALIAS}" \
                   -file "${CERT_FILE}" \
                   -storepass "${KEYSTORE_PASSWORD}" \
                   -noprompt &>/dev/null; then
            success "Certificate imported successfully"
            ((SUCCESS_COUNT++))
        else
            error "Failed to import certificate"
            ((FAIL_COUNT++))
        fi
    done <<< "${JAVA_HOMES}"
}

function print_summary() {
    echo
    success "Successfully imported: ${SUCCESS_COUNT}"
    if [[ "${FAIL_COUNT}" -gt 0 ]]; then
        error "Failed: ${FAIL_COUNT}"
    fi

    echo
    if [[ "${SUCCESS_COUNT}" -gt 0 ]]; then
        success "Certificate import complete!"
        echo
        echo "The Cloudflare WARP certificate has been imported into your"
        echo "Java keystores. You can now build Android apps with WARP enabled."
        echo
        info "Gradle daemon will automatically use the updated certificates when it restarts on your next build."
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
        exec sudo bash "${BASH_SOURCE[0]}" "$@"
    fi

    # At this point, we're running with sudo and certs need to be imported
    title "Cloudflare WARP Certificate Importer"

    # Verify certificate file exists
    if [[ ! -f "${CERT_FILE}" ]]; then
        error "Cloudflare certificate not found at: ${CERT_FILE}\nMake sure you have the Expensidev repository cloned and that App is a child of Expensidev.\nAlternatively, manually follow this stackoverflow: https://stackoverflowteams.com/c/expensify/questions/18506"
        exit 1
    fi

    title "Step 1: Stopping Gradle daemons"
    stop_gradle_daemons

    title "Step 2: Finding all Java installations"
    find_java_installations

    title "Step 3: Importing certificate into Java keystores"
    import_certificates

    print_summary
}

main "$@"
