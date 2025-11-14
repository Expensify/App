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

# Source shellUtils for colorized output
source "${SCRIPT_DIR}/shellUtils.sh"

# Global constants
readonly CERT_ALIAS="cloudflare-gateway-root"
readonly CERT_FILE="/tmp/cloudflare-gateway-ca.pem"
readonly KEYSTORE_PASSWORD="changeit"
readonly TEST_DOMAIN="plugins.gradle.org"

# Cleanup temporary files on exit (invoked via trap)
# shellcheck disable=SC2329
function cleanup_temp_files() {
    rm -f /tmp/cloudflare-chain.pem /tmp/cloudflare-cert-*.pem
}
trap cleanup_temp_files EXIT

# Functions

function stop_gradle_daemons() {
    title "Step 1: Stopping Gradle daemons"
    
    local DAEMON_STOPPED=false
    
    # Method 1: Use gradle/gradlew globally if available
    if command -v gradle &>/dev/null; then
        info "Stopping Gradle daemons globally..."
        gradle --stop &>/dev/null || true
        DAEMON_STOPPED=true
    fi
    
    # Method 2: Find all gradlew files and stop their daemons
    local -a SEARCH_DIRS=(
        "${HOME}/Expensidev"
        "${HOME}/dev"
        "${HOME}/projects"
        "${HOME}/workspace"
    )
    
    local SEARCH_DIR
    for SEARCH_DIR in "${SEARCH_DIRS[@]}"; do
        if [[ -d "${SEARCH_DIR}" ]]; then
            local GRADLEW_PATH
            while IFS= read -r GRADLEW_PATH; do
                local GRADLE_DIR
                GRADLE_DIR=$(dirname "${GRADLEW_PATH}")
                info "Stopping Gradle daemon in ${GRADLE_DIR}..."
                (cd "${GRADLE_DIR}" && ./gradlew --stop &>/dev/null) || true
                DAEMON_STOPPED=true
            done < <(find "${SEARCH_DIR}" -name gradlew -type f 2>/dev/null | head -10)
        fi
    done
    
    # Method 3: Kill any remaining Gradle daemon processes
    if pgrep -f "GradleDaemon" &>/dev/null; then
        info "Terminating remaining Gradle daemon processes..."
        pkill -f "GradleDaemon" &>/dev/null || true
        DAEMON_STOPPED=true
    fi
    
    if [[ "${DAEMON_STOPPED}" == true ]]; then
        success "Gradle daemon(s) stopped"
    else
        info "No Gradle daemons found (this is OK)"
    fi
}

function extract_cloudflare_certificate() {
    title "Step 2: Extracting Cloudflare Gateway Root CA certificate"
    
    # Extract the full certificate chain
    echo | openssl s_client -showcerts -connect "${TEST_DOMAIN}:443" 2>/dev/null \
        | awk '/BEGIN CERTIFICATE/,/END CERTIFICATE/' > /tmp/cloudflare-chain.pem
    
    # Split certificates
    awk 'BEGIN {certnum=0} 
         /BEGIN CERTIFICATE/ {certnum++; file="/tmp/cloudflare-cert-"certnum".pem"} 
         {print > file}' /tmp/cloudflare-chain.pem
    
    # Find the root CA (self-signed certificate where subject == issuer)
    local CERT_FILE_PATH
    for CERT_FILE_PATH in /tmp/cloudflare-cert-*.pem; do
        if [[ -f "${CERT_FILE_PATH}" ]]; then
            local SUBJECT
            local ISSUER
            SUBJECT=$(openssl x509 -in "${CERT_FILE_PATH}" -noout -subject 2>/dev/null || echo)
            ISSUER=$(openssl x509 -in "${CERT_FILE_PATH}" -noout -issuer 2>/dev/null || echo)
            
            if [[ "${SUBJECT}" == "${ISSUER}" ]] && [[ "${SUBJECT}" == *"Cloudflare"* ]]; then
                cp "${CERT_FILE_PATH}" "${CERT_FILE}"
                success "Found Cloudflare Gateway Root CA"
                info "Subject: ${SUBJECT}"
                break
            fi
        fi
    done
    
    if [[ ! -f "${CERT_FILE}" ]]; then
        error "Failed to extract Cloudflare root CA certificate"
        info "Are you connected to Cloudflare WARP?"
        exit 1
    fi
}

function find_java_installations() {
    title "Step 3: Finding all Java installations"
    
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
    
    title "Step 4: Importing certificate into Java keystores"
    
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
    title "Cloudflare WARP Certificate Importer"
    
    check_sudo
    stop_gradle_daemons
    extract_cloudflare_certificate
    
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

