# Proof Request Templates

This document explains how to create, configure, and use proof request templates in the Confirmd wallet application.

## Overview

Proof request templates are pre-defined verification requests that allow verifiers to request specific data from credential holders. The system supports multiple credential formats and provides flexible configuration options for various verification scenarios.

## Template Architecture

### Supported Credential Formats

1. **AnonCreds/Indy** - Traditional self-sovereign identity format
2. **W3C Verifiable Credentials** - Modern web standard format  
3. **DIF (Decentralized Identity Foundation)** - Future extensibility format

### Template Types

- **Local Templates** - Defined in application code
- **Remote Templates** - Fetched from external servers
- **Development Templates** - Only visible in development mode

## Template Structure

```typescript
interface ProofRequestTemplate {
  id: string                    // Unique identifier
  name: string                  // Display name for users
  description: string           // Description of what the proof requests
  version: string               // Template version (e.g., "1.0.0")
  devOnly?: boolean            // If true, only shown in development mode
  payload: ProofRequestPayload  // The actual proof request configuration
}
```

### Payload Structure

```typescript
interface ProofRequestPayload {
  type: ProofRequestType        // "anoncreds", "indy", or "dif"
  data: Array<{
    schema: string              // Schema identifier
    requestedAttributes?: Array<RequestedAttribute>
    requestedPredicates?: Array<RequestedPredicate>
  }>
}
```

## Adding Local Templates

### Step 1: Edit Template File

Modify `/verifier/request-templates.ts`:

```typescript
import {
  ProofRequestTemplate,
  ProofRequestType,
} from "./types/proof-reqeust-template";

export const useProofRequestTemplates = () => {
  const defaultProofRequestTemplates: Array<ProofRequestTemplate> = [
    {
      id: "student-verification",
      name: "Student Verification",
      description: "Verify student first and last name",
      version: "1.0.0",
      devOnly: false,
      payload: {
        type: ProofRequestType.AnonCreds,
        data: [
          {
            schema: "student_card_schema",
            requestedAttributes: [
              {
                name: "student_first_name",
                restrictions: [
                  {
                    cred_def_id: "XUxBrVSALWHLeycAUhrNr9:3:CL:26293:student_card"
                  }
                ]
              },
              {
                name: "student_last_name",
                restrictions: [
                  {
                    cred_def_id: "XUxBrVSALWHLeycAUhrNr9:3:CL:26293:student_card"
                  }
                ]
              }
            ]
          }
        ]
      }
    }
  ];

  return defaultProofRequestTemplates;
};
```

## Adding Remote Templates

### Step 1: Configure Remote URL

Set the template URL in your configuration:

```typescript
// In app/defaultConfiguration.ts
export const defaultConfiguration: ConfigurationContext = {
  // ... other config
  proofTemplateBaseUrl: "https://your-server.com/templates/",
  // ... rest of config
}
```

### Step 2: Create Remote Template File

Create `anoncreds-verification-templates.json` on your server:

```json
[
  {
    "id": "employee-verification",
    "name": "Employee Verification",
    "description": "Verify employment status and department",
    "version": "1.0.0",
    "payload": {
      "type": "anoncreds",
      "data": [
        {
          "schema": "employee_credential",
          "requestedAttributes": [
            {
              "name": "employee_id",
              "restrictions": [
                {
                  "cred_def_id": "Company123:3:CL:789:employee_cred"
                }
              ]
            },
            {
              "name": "department",
              "restrictions": [
                {
                  "cred_def_id": "Company123:3:CL:789:employee_cred"
                }
              ]
            }
          ]
        }
      ]
    }
  }
]
```

## Advanced Features

### Zero-Knowledge Predicates

Use predicates to verify conditions without revealing exact values:

```typescript
requestedPredicates: [
  {
    name: "age",
    predicateType: ">=",        // ">=", ">", "<=", "<"
    predicateValue: 21,
    parameterizable: true,      // Allows runtime customization
    restrictions: [
      {
        cred_def_id: "Gov123:3:CL:456:government_id"
      }
    ]
  }
]
```

### Multi-Attribute Requests

Request multiple attributes together:

```typescript
requestedAttributes: [
  {
    names: ["first_name", "last_name"],  // Multiple attributes
    revealed: true,                      // Whether to reveal values
    restrictions: [
      {
        cred_def_id: "specific_credential_definition"
      }
    ]
  }
]
```

### Template Markers

Use dynamic markers for time-based values:

```json
{
  "name": "expiry_date",
  "predicateType": ">=",
  "predicateValue": "@{currentDate(-1)}"
}
```

Available markers:
- `@{now}` - Current timestamp
- `@{currentDate(offset)}` - Date with year offset

### Credential Restrictions

Control which credentials can satisfy the request:

```typescript
restrictions: [
  {
    cred_def_id: "specific_credential_definition",  // Specific credential
    schema_id: "schema_identifier",                // Specific schema  
    issuer_did: "issuer_identifier"               // Specific issuer
  }
]
```

## Configuration Options

### Template Resolution Architecture

The application uses a hierarchical template resolution system:

```
useTemplates() → 
useRemoteProofBundleResolver() → 
(Check proofTemplateBaseUrl) → 
Remote Templates OR DefaultProofBundleResolver() → 
Local Templates from useProofRequestTemplates()
```

### Making Local Templates Available

#### Option 1: Enable Developer Mode (Easiest)

Navigate to **Settings > Developer** in the app and toggle **"Use Dev Verifier Templates"** to ON.

```typescript
// This enables all templates including devOnly: true
store.preferences.useDevVerifierTemplates = true
```

#### Option 2: Disable Remote Template URL (Recommended)

Comment out or remove the remote URL in your `.env` file to force local template usage:

```bash
# .env file
# PROOF_TEMPLATE_URL=https://your-server.com/templates/  # Commented out
OCA_URL=https://your-oca-server.com/
```

This forces the system to use `DefaultProofBundleResolver` which loads local templates from `/verifier/request-templates.ts`.

#### Option 3: Configure Working Remote Server

Ensure your remote server hosts valid templates at the configured URL:

```bash
# .env file
PROOF_TEMPLATE_URL=https://your-working-server.com/templates/
```

The server must serve `anoncreds-verification-templates.json` at the specified URL.

### Development Mode

Enable development templates for testing:

```typescript
// In app settings - shows all templates including devOnly: true
store.preferences.useDevVerifierTemplates = true
```

Templates with `devOnly: true` will only be visible when this setting is enabled.

### Environment Variables

Configure template resolution via environment variables:

```bash
# .env file
PROOF_TEMPLATE_URL=https://your-server.com/templates/
OCA_URL=https://your-oca-server.com/

# Other related settings
MEDIATOR_URL=https://your-mediator.com
PUBLIC_ORG=https://your-organization.com
```

### Template Filtering Logic

Templates are filtered in `ListProofRequests.tsx`:

```typescript
const proofRequestTemplates = useTemplates().filter(
  tem => store.preferences.useDevVerifierTemplates || !tem.devOnly
)
```

- **Production**: Only shows templates with `devOnly: false`
- **Development Mode**: Shows all templates including `devOnly: true`

## Testing Templates

### Step-by-Step Testing

1. **Add your template** using local or remote method
2. **Navigate to Settings > Send Proof Request** in the app
3. **Select your template** from the available list
4. **Send to a connection** or generate QR code
5. **Test with receiving wallet** to verify correct behavior

### Template Validation

Ensure your templates:
- Have unique IDs across all templates
- Include proper credential restrictions
- Use valid predicate operators
- Have clear, user-friendly names and descriptions

## Example Templates

### Basic Attribute Request

```typescript
{
  id: "name-verification",
  name: "Name Verification",
  description: "Verify your full name",
  version: "1.0.0",
  payload: {
    type: ProofRequestType.AnonCreds,
    data: [
      {
        schema: "identity_schema",
        requestedAttributes: [
          {
            name: "full_name",
            restrictions: [
              {
                cred_def_id: "Gov123:3:CL:456:identity_card"
              }
            ]
          }
        ]
      }
    ]
  }
}
```

### Age Verification (Zero-Knowledge)

```typescript
{
  id: "age-proof",
  name: "Age Verification",
  description: "Prove you are over 18 without revealing exact age",
  version: "1.0.0",
  payload: {
    type: ProofRequestType.AnonCreds,
    data: [
      {
        schema: "government_id_schema",
        requestedPredicates: [
          {
            name: "age",
            predicateType: ">=",
            predicateValue: 18,
            restrictions: [
              {
                cred_def_id: "Gov123:3:CL:456:government_id"
              }
            ]
          }
        ]
      }
    ]
  }
}
```

### Multi-Schema Request

```typescript
{
  id: "comprehensive-verification",
  name: "Comprehensive Verification",
  description: "Verify identity and education credentials",
  version: "1.0.0",
  payload: {
    type: ProofRequestType.AnonCreds,
    data: [
      {
        schema: "identity_schema",
        requestedAttributes: [
          {
            name: "full_name",
            restrictions: [
              {
                cred_def_id: "Gov123:3:CL:456:identity_card"
              }
            ]
          }
        ]
      },
      {
        schema: "education_schema",
        requestedAttributes: [
          {
            name: "degree",
            restrictions: [
              {
                cred_def_id: "Uni123:3:CL:789:diploma"
              }
            ]
          }
        ]
      }
    ]
  }
}
```

## Best Practices

### Privacy-First Design
- Use **predicates** instead of revealing exact values when possible
- Request only **necessary attributes** for your use case
- Consider **selective disclosure** for multi-attribute credentials

### User Experience
- Use **clear, descriptive names** for templates
- Provide **meaningful descriptions** that explain what will be shared
- **Version your templates** for easier maintenance and updates

### Security
- Use **proper restrictions** to ensure only valid credentials are accepted
- **Validate template structure** before deployment
- **Test thoroughly** with actual credentials before production use

### Maintenance
- Keep templates **up to date** with schema changes
- **Monitor usage** and user feedback
- **Document any custom markers** or special configurations

## Troubleshooting

### Common Issues and Solutions

#### Template not appearing in list

**Issue**: Local templates from `/verifier/request-templates.ts` are not showing up in the app.

**Solutions**:
1. **Check Remote URL Configuration**: 
   ```bash
   # In .env file - comment out to force local templates
   # PROOF_TEMPLATE_URL=https://platform.confamd.com/templates/
   ```

2. **Enable Developer Mode**:
   - Navigate to **Settings > Developer**
   - Toggle **"Use Dev Verifier Templates"** to ON
   - This shows all templates including `devOnly: true`

3. **Verify Template Structure**:
   ```typescript
   // Ensure your templates are properly exported
   export const useProofRequestTemplates = () => {
     const defaultProofRequestTemplates: Array<ProofRequestTemplate> = [
       // Your templates here
     ];
     return defaultProofRequestTemplates;
   };
   ```

4. **Check devOnly Flag**:
   ```typescript
   {
     id: "your-template",
     devOnly: false,  // Set to false for production visibility
     // ... rest of template
   }
   ```

#### Template Resolution Debugging

**Issue**: Need to understand which resolver is being used.

**Debug Steps**:
1. **Check Configuration**:
   ```typescript
   // In useRemoteProofBundleResolver
   console.log('proofTemplateBaseUrl:', proofTemplateBaseUrl);
   // If undefined/empty, uses DefaultProofBundleResolver
   ```

2. **Verify Template Loading**:
   ```typescript
   // In useTemplates hook
   console.log('Loaded templates:', proofRequestTemplates);
   console.log('Filtered templates:', proofRequestTemplates.filter(tem => 
     store.preferences.useDevVerifierTemplates || !tem.devOnly
   ));
   ```

#### Remote Template Server Issues

**Issue**: Remote server not serving templates correctly.

**Solutions**:
1. **Test Server Endpoint**:
   ```bash
   curl https://your-server.com/templates/anoncreds-verification-templates.json
   ```

2. **Verify JSON Format**:
   ```json
   [
     {
       "id": "template-id",
       "name": "Template Name",
       "description": "Template Description",
       "version": "1.0.0",
       "payload": {
         "type": "anoncreds",
         "data": [...]
       }
     }
   ]
   ```

3. **Check CORS Headers** (if serving from web):
   ```
   Access-Control-Allow-Origin: *
   Content-Type: application/json
   ```

#### "Template not found" Error (Error Code 1038)

**Issue**: Users get "Unable to generate a proof request. Error code 1038 - Template not found" when trying to use a proof request.

**Root Cause**: This error typically occurs when the `DefaultProofBundleResolver` fails to properly load local templates due to React Hook usage violations.

**Solutions**:

1. **Verify Environment Configuration**:
   ```bash
   # In .env file - ensure PROOF_TEMPLATE_URL is commented out for local templates
   # PROOF_TEMPLATE_URL=https://platform.confamd.com/templates/
   ```

2. **Check Template Function Export**:
   ```typescript
   // In /verifier/request-templates.ts
   export const useProofRequestTemplates = (acceptDevRestrictions?: boolean) => {
     const defaultProofRequestTemplates: Array<ProofRequestTemplate> = [
       // Your templates must be here
     ];
     
     // Filter based on dev restrictions if needed
     if (acceptDevRestrictions === false) {
       return defaultProofRequestTemplates.filter(template => !template.devOnly);
     }
     
     return defaultProofRequestTemplates;
   };
   ```

3. **Verify DefaultProofBundleResolver Architecture**:
   ```typescript
   // In app/utils/proofBundle.ts - ensure proper constructor
   export class DefaultProofBundleResolver implements ProofBundleResolverType {
     private proofRequestTemplates
     
     // Constructor must accept template function as parameter
     public constructor(proofRequestTemplates?: (acceptDevRestrictions?: boolean) => ProofRequestTemplate[]) {
       this.proofRequestTemplates = proofRequestTemplates ?? useProofRequestTemplates
     }
   }
   
   // In useRemoteProofBundleResolver function
   export const useRemoteProofBundleResolver = (indexFileBaseUrl: string | undefined): ProofBundleResolverType => {
     const { proofRequestTemplates } = useConfiguration() // Hook called correctly here
     if (indexFileBaseUrl) {
       return new RemoteProofBundleResolver(indexFileBaseUrl)
     } else {
       return new DefaultProofBundleResolver(proofRequestTemplates) // Pass function to constructor
     }
   }
   ```

**Common Anti-Pattern** (DO NOT DO):
```typescript
// WRONG - This causes Hook usage violation
export class DefaultProofBundleResolver {
  public constructor() {
    const { proofRequestTemplates } = useConfiguration() // ❌ Hooks cannot be called in class constructors
    this.proofRequestTemplates = proofRequestTemplates
  }
}
```

4. **Test Template Resolution**:
   ```typescript
   // Add temporary debug logging to verify template loading
   console.log('Available template IDs:', useProofRequestTemplates().map(t => t.id));
   console.log('Looking for template ID:', templateId);
   ```

5. **Clear Metro Cache and Rebuild**:
   ```bash
   npx react-native start --reset-cache
   cd android && ./gradlew clean && ./gradlew assembleDebug
   ```

#### React Hook Rules Violation

**Issue**: 
```
ERROR Warning: Do not call Hooks inside useEffect(...), useMemo(...), or other built-in Hooks.
ERROR Warning: React has detected a change in the order of Hooks called by ListProofRequests.
```

**Root Cause**: Calling `useConfiguration()` hook inside `useMemo` or other hooks violates React's Rules of Hooks.

**Solution**: Create a non-hook function for resolver creation:

```typescript
// ✅ CORRECT: Non-hook function
export const createProofBundleResolver = (
  indexFileBaseUrl: string | undefined, 
  proofRequestTemplates?: (acceptDevRestrictions?: boolean) => ProofRequestTemplate[]
): ProofBundleResolverType => {
  if (indexFileBaseUrl) {
    return new RemoteProofBundleResolver(indexFileBaseUrl)
  } else {
    return new DefaultProofBundleResolver(proofRequestTemplates)
  }
}

// ✅ CORRECT: Call hooks at top level of React hook
export const useTemplates = (): Array<ProofRequestTemplate> => {
  const [proofRequestTemplates, setProofRequestTemplates] = useState<ProofRequestTemplate[]>([])
  const { proofTemplateBaseUrl, proofRequestTemplates: configTemplates } = useConfiguration()
  
  const resolver = useMemo(() => {
    return createProofBundleResolver(proofTemplateBaseUrl, configTemplates) // ✅ No hooks called inside useMemo
  }, [proofTemplateBaseUrl, configTemplates])
  
  // ... rest of hook
}
```

**Common Anti-Pattern** (DO NOT DO):
```typescript
// ❌ WRONG - Calling hook inside useMemo
export const useTemplates = (): Array<ProofRequestTemplate> => {
  const { proofTemplateBaseUrl } = useConfiguration()
  
  const resolver = useMemo(() => {
    return useRemoteProofBundleResolver(proofTemplateBaseUrl) // ❌ Hook called inside useMemo
  }, [proofTemplateBaseUrl])
}

// ❌ WRONG - useRemoteProofBundleResolver calls useConfiguration() hook
export const useRemoteProofBundleResolver = (indexFileBaseUrl: string | undefined) => {
  const { proofRequestTemplates } = useConfiguration() // ❌ Hook inside another function called from useMemo
  // ...
}
```

#### Navigation and Runtime Errors

**Issue**: `TypeError: Cannot read property 'connectionId' of undefined`

**Solution**: This has been fixed in the codebase:
```typescript
// Fixed in ListProofRequests.tsx
const { connectionId } = route?.params || {}
```

**Issue**: React Navigation serialization warnings.

**Solution**: Navigation objects are no longer passed as parameters:
```typescript
// Before (caused warnings):
navigation.navigate(Screens.ProofRequests, { 
  navigation: navigation, 
  connectionId 
});

// After (fixed):
navigation.navigate(Screens.ProofRequests, { 
  connectionId 
});
```

#### Architecture-Specific Debugging

**Template Resolution Flow**:
```typescript
// Debug the full resolution chain
1. useTemplates() // Entry point
2. useConfiguration().proofTemplateBaseUrl // Check remote URL
3. useRemoteProofBundleResolver() // Creates resolver
4. resolver.resolve() // Attempts to load templates
5. DefaultProofBundleResolver (fallback) // If no remote URL
6. useProofRequestTemplates() // Your local templates
7. applyTemplateMarkers() // Process dynamic values
8. Filter by devOnly flag // Final filtering
```

**File Locations to Check**:
- `/verifier/request-templates.ts` - Your local templates
- `/app/defaultConfiguration.ts` - Configuration setup
- `/app/utils/proofBundle.ts` - Template resolution logic
- `/app/hooks/proof-request-templates.ts` - Template hooks
- `/.env` - Environment configuration

### Quick Reference: Error 1038 Fix

**If you encounter "Template not found" error 1038**, the most likely cause is React Hook usage violation in `DefaultProofBundleResolver`. Here's the correct implementation:

```typescript
// ✅ CORRECT: Pass template function as parameter
export class DefaultProofBundleResolver implements ProofBundleResolverType {
  private proofRequestTemplates
  
  public constructor(proofRequestTemplates?: (acceptDevRestrictions?: boolean) => ProofRequestTemplate[]) {
    this.proofRequestTemplates = proofRequestTemplates ?? useProofRequestTemplates
  }
  
  public async resolveById(templateId: string, acceptDevRestrictions: boolean): Promise<ProofRequestTemplate | undefined> {
    const templates = this.proofRequestTemplates(acceptDevRestrictions);
    const template = templates.find(template => template.id === templateId);
    return Promise.resolve(template)
  }
}

// ✅ CORRECT: Call hook at appropriate level and pass function down
export const useRemoteProofBundleResolver = (indexFileBaseUrl: string | undefined): ProofBundleResolverType => {
  const { proofRequestTemplates } = useConfiguration() // Hook called in function component context
  if (indexFileBaseUrl) {
    return new RemoteProofBundleResolver(indexFileBaseUrl)
  } else {
    return new DefaultProofBundleResolver(proofRequestTemplates) // Pass function to constructor
  }
}
```

**Checklist for Error 1038**:
- [ ] `PROOF_TEMPLATE_URL` is commented out in `.env`
- [ ] Templates exist in `/verifier/request-templates.ts`
- [ ] `DefaultProofBundleResolver` accepts template function as parameter
- [ ] `createProofBundleResolver` is used instead of `useRemoteProofBundleResolver` (hook-free function)
- [ ] Hooks (`useConfiguration`) are called at top level of React components, not inside `useMemo`
- [ ] Metro cache cleared and app rebuilt

### Debug Mode

Enable comprehensive debugging:

```typescript
// In development - add to relevant files
console.log('=== Template Debug Info ===');
console.log('Remote URL:', proofTemplateBaseUrl);
console.log('Available templates:', templates);
console.log('Dev mode enabled:', store.preferences.useDevVerifierTemplates);
console.log('Filtered templates:', filteredTemplates);
console.log('Template resolution path:', resolverType);
```

### Verification Checklist

Before deploying templates, verify:

- [ ] Templates are properly exported from `/verifier/request-templates.ts`
- [ ] `devOnly` flags are set correctly for your environment
- [ ] Remote URL is commented out in `.env` if using local templates
- [ ] Template IDs are unique across all templates
- [ ] Credential definition IDs are valid and accessible
- [ ] Schema identifiers match your credential schemas
- [ ] Predicate syntax and values are correct
- [ ] Template markers use proper syntax: `@{marker}`
- [ ] App is restarted after environment changes

## API Reference

### Key Functions

- `useTemplates()` - Get all available templates
- `useTemplate(id)` - Get specific template by ID
- `buildProofRequestDataForTemplate()` - Build proof request from template
- `hasPredicates(template)` - Check if template contains predicates
- `isParameterizable(template)` - Check if template has parameterizable predicates

### Template Resolution Flow

1. Check for local templates in `useProofRequestTemplates()`
2. If `proofTemplateBaseUrl` configured, fetch remote templates
3. Apply template markers for dynamic values
4. Filter by development mode settings
5. Return processed templates to UI

This documentation provides a complete guide for working with proof request templates in the Confirmd wallet application.