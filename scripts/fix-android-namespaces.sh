#!/bin/bash

# Fix Android namespace issues for React Native modules
# This script adds namespace declarations to modules that are missing them

# Get the script directory and go to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

echo "🔧 Fixing Android namespace issues..."
echo "📁 Working directory: $(pwd)"

# Function to add namespace to a build.gradle file
add_namespace() {
    local file_path="$1"
    local namespace="$2"
    
    if [ -f "$file_path" ]; then
        # Check if namespace already exists
        if grep -q "namespace " "$file_path"; then
            echo "✅ Namespace already exists in $file_path"
            return 0
        fi
        
        # Add namespace after android { line
        sed -i.bak "s/android {/android {\n    namespace \"$namespace\"/" "$file_path"
        
        if [ $? -eq 0 ]; then
            echo "✅ Added namespace '$namespace' to $file_path"
            rm -f "$file_path.bak"
            return 0
        else
            echo "❌ Failed to add namespace to $file_path"
            # Restore backup if sed failed
            [ -f "$file_path.bak" ] && mv "$file_path.bak" "$file_path"
            return 1
        fi
    else
        echo "⚠️ File not found: $file_path"
        return 1
    fi
}

# Main Hyperledger modules
add_namespace "node_modules/@hyperledger/anoncreds-react-native/android/build.gradle" "org.hyperledger.anoncreds"
add_namespace "node_modules/@hyperledger/aries-askar-react-native/android/build.gradle" "org.hyperledger.ariesaskar"
add_namespace "node_modules/@hyperledger/indy-vdr-react-native/android/build.gradle" "org.hyperledger.indyvdr"

# Other common modules that need namespaces
add_namespace "node_modules/react-native-argon2/android/build.gradle" "com.poowf.argon2"
add_namespace "node_modules/@react-native-community/masked-view/android/build.gradle" "org.reactnative.maskedview"
add_namespace "node_modules/@react-native-community/netinfo/android/build.gradle" "com.reactnativecommunity.netinfo"
add_namespace "node_modules/react-native-device-info/android/build.gradle" "com.learnium.RNDeviceInfo"
add_namespace "node_modules/react-native-splash-screen/android/build.gradle" "org.devio.rn.splashscreen"
add_namespace "node_modules/react-native-document-picker/android/build.gradle" "com.reactnativedocumentpicker"
add_namespace "node_modules/react-native-fs/android/build.gradle" "com.rnfs"
add_namespace "node_modules/react-native-share/android/build.gradle" "cl.json"
add_namespace "node_modules/react-native-vector-icons/android/build.gradle" "com.oblador.vectoricons"
add_namespace "node_modules/react-native-tcp-socket/android/build.gradle" "com.asterinet.react.tcpsocket"
add_namespace "node_modules/react-native-html-to-pdf/android/build.gradle" "com.christopherdro.htmltopdf"
add_namespace "node_modules/react-native-zip-archive/android/build.gradle" "com.rnziparchive"
add_namespace "node_modules/react-native-securerandom/android/build.gradle" "net.rhogan.rnsecurerandom"
add_namespace "node_modules/react-native-randombytes/android/build.gradle" "com.bitgo.randombytes"
add_namespace "node_modules/react-native-vision-camera/android/build.gradle" "com.mrousavy.camera"

echo "🎉 Android namespace fixes completed!"
echo "💡 Run this script after 'yarn install' to ensure namespaces persist"