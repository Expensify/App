#!/bin/bash

# iOS Development Account Setup Script
# =====================================
#
# Purpose:
# --------
# This script assists developers in setting up their iOS development environment
# by configuring unique bundle identifiers and enabling automatic signing for
# development builds.
#
# Background:
# -----------
# When developing iOS apps with shared codebases, each developer needs unique
# bundle identifiers to avoid conflicts. This script automates the process of
# updating bundle IDs and enabling automatic signing for development targets.
#
# Usage:
# ------
# To configure your iOS development environment, run:
# npm run setup-ios

# Use functions and variables from the utils script
source scripts/shellUtils.sh

# Paths to the files we'll be modifying
PROJECT_FILE="ios/NewExpensify.xcodeproj/project.pbxproj"
ENTITLEMENTS_DIR="ios/NewExpensify"
NOTIFICATION_ENTITLEMENTS="ios/NotificationServiceExtension/NotificationServiceExtension.entitlements"
SHARE_ENTITLEMENTS="ios/ShareViewController/ShareViewController.entitlements"

# Function to validate the unique ID
validate_unique_id() {
    local id="$1"
    
    # Check if ID is empty
    if [[ -z "$id" ]]; then
        return 1
    fi
    
    # Check if ID contains only valid characters (alphanumeric, hyphen, underscore)
    if [[ ! "$id" =~ ^[a-zA-Z0-9_-]+$ ]]; then
        return 1
    fi
    
    # Check if ID is not too long (Apple has limits on bundle ID length)
    if [[ ${#id} -gt 50 ]]; then
        return 1
    fi
    
    return 0
}

# Function to enable automatic signing for a specific configuration
enable_automatic_signing() {
    local config_name="$1"
    local project_file="$2"
    
    # Change CODE_SIGN_STYLE from Manual to Automatic
    sed -i.bak "/$config_name/,/};/s/CODE_SIGN_STYLE = Manual;/CODE_SIGN_STYLE = Automatic;/" "$project_file"
    
    # Remove provisioning profile specifications for automatic signing
    sed -i.bak "/$config_name/,/};/s/PROVISIONING_PROFILE_SPECIFIER = .*;/PROVISIONING_PROFILE_SPECIFIER = \"\";/" "$project_file"
    sed -i.bak "/$config_name/,/};/s/\"PROVISIONING_PROFILE_SPECIFIER\\[sdk=iphoneos\\*\\]\" = .*;/\"PROVISIONING_PROFILE_SPECIFIER[sdk=iphoneos*]\" = \"\";/" "$project_file"
}

# Function to update bundle identifiers
update_bundle_identifiers() {
    local unique_id="$1"
    local project_file="$2"
    
    # Update main app bundle identifiers
    sed -i.bak "s/com\.expensify\.chat\.dev/com.$unique_id.chat.dev/g" "$project_file"
    
    # Update notification service extension bundle identifiers  
    sed -i.bak "s/com\.expensify\.chat\.dev\.NotificationServiceExtension/com.$unique_id.chat.dev.NotificationServiceExtension/g" "$project_file"
}

# Function to update app group identifiers
update_app_groups() {
    local unique_id="$1"
    
    # List of entitlement files to update
    local entitlement_files=(
        "$ENTITLEMENTS_DIR/NewExpensifyDebugDevelopment.entitlements"
        "$ENTITLEMENTS_DIR/NewExpensifyReleaseDevelopment.entitlements"
        "$ENTITLEMENTS_DIR/Chat.entitlements"
        "$NOTIFICATION_ENTITLEMENTS"
        "$SHARE_ENTITLEMENTS"
    )
    
    # Update group identifiers in each file
    for file in "${entitlement_files[@]}"; do
        if [[ -f "$file" ]]; then
            sed -i.bak "s/group\.com\.expensify\.new/group.com.$unique_id.new/g" "$file"
        fi
    done
    
    # Also update in Swift files that might reference the app group
    if [[ -f "ios/ShareViewController/ShareViewController.swift" ]]; then
        sed -i.bak "s/group\.com\.expensify\.new/group.com.$unique_id.new/g" "ios/ShareViewController/ShareViewController.swift"
    fi
    
    if [[ -f "ios/NotificationServiceExtension/NotificationService.swift" ]]; then
        sed -i.bak "s/group\.com\.expensify\.new/group.com.$unique_id.new/g" "ios/NotificationServiceExtension/NotificationService.swift"
    fi
    
    if [[ -f "ios/RCTShareActionHandlerModule.m" ]]; then
        sed -i.bak "s/group\.com\.expensify\.new/group.com.$unique_id.new/g" "ios/RCTShareActionHandlerModule.m"
    fi
}

# Main script execution
title "iOS Development Account Setup"
echo -e "\nThis script will help you configure your iOS development environment with unique bundle identifiers.\n"

# Check if project file exists
if [[ ! -f "$PROJECT_FILE" ]]; then
    error "Project file not found at $PROJECT_FILE"
    echo "Please ensure you're running this script from the project root directory."
    exit 1
fi

# Prompt for unique ID
echo "Please enter a unique identifier for your development bundle IDs."
echo "This will replace 'expensify' in bundle identifiers like 'com.expensify.chat.dev'"
echo "For example, if you enter 'andrew', the bundle ID will become 'com.andrew.chat.dev'"
echo -e "\nRequirements:"
echo "  - Use only alphanumeric characters, hyphens, or underscores"
echo "  - Keep it short (max 50 characters)"
echo "  - Make it unique to avoid conflicts with other developers"
echo ""

read -r -p "Unique identifier: " UNIQUE_ID

# Validate the unique ID
if ! validate_unique_id "$UNIQUE_ID"; then
    error "Invalid unique identifier. Please use only alphanumeric characters, hyphens, or underscores (max 50 chars)."
    exit 1
fi

# Confirm the changes with the user
echo -e "\n"
info "The following changes will be made:"
echo "  1. Enable automatic signing for Debug and Development configurations"
echo "  2. Update bundle IDs: com.expensify.chat.dev → com.$UNIQUE_ID.chat.dev"
echo "  3. Update app groups: group.com.expensify.new → group.com.$UNIQUE_ID.new"
echo ""

read -r -p "Do you want to proceed? (y/n): " CONFIRM

if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    echo "Setup cancelled."
    exit 0
fi

# Step 1: Enable automatic signing for development configurations
echo -e "\n"
info "Enabling automatic signing for development targets..."

# List of configurations to update (Debug and Development variants)
CONFIGS_TO_UPDATE=(
    "Debug"
    "DebugDevelopment"
    "ReleaseDevelopment"
)

for config in "${CONFIGS_TO_UPDATE[@]}"; do
    enable_automatic_signing "$config" "$PROJECT_FILE"
done

success "Automatic signing enabled for development configurations"

# Step 2: Update bundle identifiers
echo -e "\n"
info "Updating bundle identifiers..."
update_bundle_identifiers "$UNIQUE_ID" "$PROJECT_FILE"
success "Bundle identifiers updated to use '$UNIQUE_ID'"

# Step 3: Update app group identifiers
echo -e "\n"
info "Updating app group identifiers..."
update_app_groups "$UNIQUE_ID"
success "App group identifiers updated to use '$UNIQUE_ID'"

# Clean up backup files created by sed
echo -e "\n"
info "Cleaning up temporary files..."
find ios -name "*.bak" -type f -delete 2>/dev/null || true

# Final instructions
echo -e "\n"
success "iOS development environment setup completed successfully!"
