#!/usr/bin/env python3

import os
import re
from pathlib import Path

def remove_package_from_manifest(manifest_path):
    """Remove package attribute from AndroidManifest.xml"""
    try:
        with open(manifest_path, 'r') as f:
            content = f.read()
        
        # Remove package="..." from manifest tag
        # Match both single and double quotes, with or without spaces
        patterns = [
            r'\s*package\s*=\s*"[^"]*"',
            r'\s*package\s*=\s*\'[^\']*\'',
            r'package\s*=\s*"[^"]*"\s*',
            r'package\s*=\s*\'[^\']*\'\s*'
        ]
        
        modified = False
        for pattern in patterns:
            if re.search(pattern, content):
                content = re.sub(pattern, '', content)
                modified = True
                break
        
        if modified:
            with open(manifest_path, 'w') as f:
                f.write(content)
            return True
        return False
        
    except Exception as e:
        print(f"Error processing {manifest_path}: {e}")
        return False

def main():
    # List of modules that need package removal based on build errors
    modules_to_fix = [
        '/Users/itopa/projects/confirmd-wallet/node_modules/@hyperledger/anoncreds-react-native/android/src/main/AndroidManifest.xml',
        '/Users/itopa/projects/confirmd-wallet/node_modules/react-native-argon2/android/src/main/AndroidManifest.xml',
        '/Users/itopa/projects/confirmd-wallet/node_modules/@hyperledger/aries-askar-react-native/android/src/main/AndroidManifest.xml',
        '/Users/itopa/projects/confirmd-wallet/node_modules/@hyperledger/indy-vdr-react-native/android/src/main/AndroidManifest.xml'
    ]
    
    # Also find all manifests that have package attributes and namespaces defined
    import subprocess
    
    # Find all android library build.gradle files with namespace
    result = subprocess.run([
        'find', '/Users/itopa/projects/confirmd-wallet/node_modules', 
        '-name', 'build.gradle', '-path', '*/android/*',
        '-exec', 'grep', '-l', 'namespace', '{}', ';'
    ], capture_output=True, text=True)
    
    namespace_gradle_files = result.stdout.strip().split('\n')
    
    # For each gradle file with namespace, check corresponding manifest
    for gradle_file in namespace_gradle_files:
        if gradle_file:
            gradle_dir = os.path.dirname(gradle_file)
            manifest_path = os.path.join(gradle_dir, 'src', 'main', 'AndroidManifest.xml')
            
            if os.path.exists(manifest_path):
                modules_to_fix.append(manifest_path)
    
    # Remove duplicates
    modules_to_fix = list(set(modules_to_fix))
    
    fixed_count = 0
    for manifest_path in modules_to_fix:
        if os.path.exists(manifest_path):
            if remove_package_from_manifest(manifest_path):
                print(f"✓ Removed package attribute from {manifest_path}")
                fixed_count += 1
            else:
                print(f"- No package attribute found in {manifest_path}")
        else:
            print(f"✗ Manifest not found: {manifest_path}")
    
    print(f"\nProcessed {len(modules_to_fix)} manifests, removed package attributes from {fixed_count}")

if __name__ == "__main__":
    main()