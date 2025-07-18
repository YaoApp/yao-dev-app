# OAuth Certificate Files Documentation

## Overview

This directory contains certificate files used for OAuth 2.1 authentication and authorization. Each file serves a specific purpose in the OAuth security infrastructure.

## Certificate Files

### 1. Token Signing Certificates

#### `signing-key.pem` 🔐

- **Purpose**: Private key for signing OAuth access tokens
- **Usage**: OAuth server uses this to sign tokens
- **Security**: ⚠️ **HIGHLY SENSITIVE** - Keep secure and never expose
- **Permissions**: 600 (read-write owner only)

#### `signing-cert.pem` 📜

- **Purpose**: Public certificate for verifying tokens
- **Usage**: Clients and resource servers use this to verify token authenticity
- **Security**: Can be shared publicly
- **Permissions**: 644 (readable by all)

### 2. mTLS Client Authentication Certificates

#### `mtls-client-ca.pem` 🏛️

- **Purpose**: CA certificate for validating client certificates
- **Usage**: OAuth server uses this to verify client TLS certificates
- **Security**: Can be shared with clients who need to validate the CA chain
- **Permissions**: 644 (readable by all)

#### `mtls-client-ca-key-TESTING-ONLY-DO-NOT-USE-IN-PRODUCTION.pem` ⚠️

- **Purpose**: CA private key for issuing client certificates
- **Usage**: Sign client certificates (TESTING ONLY)
- **Security**: 🚨 **EXTREMELY SENSITIVE** - Never use in production
- **Permissions**: 600 (read-write owner only)

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    OAuth Security Flow                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. mTLS Handshake                                              │
│     Client ──[Client Certificate]──> OAuth Server              │
│     OAuth Server validates using mtls-client-ca.pem            │
│                                                                 │
│  2. Token Issuance                                              │
│     OAuth Server signs tokens using signing-key.pem            │
│     Client verifies tokens using signing-cert.pem              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Usage Scenarios

### High-Security Environments

- **Financial APIs**: Banking and payment systems
- **Healthcare**: Medical data exchange (HIPAA compliance)
- **Government**: Classified information systems
- **Enterprise**: Internal microservices communication

### Client Certificate Workflow

1. **Generate client private key**
2. **Create Certificate Signing Request (CSR)**
3. **Sign CSR with CA private key** (using the TESTING-ONLY file)
4. **Deploy client certificate** to client application
5. **OAuth server validates** client certificate against CA

## Production Security Best Practices

### 🚨 Critical Security Warnings

1. **Never store CA private keys in application directories**
2. **Use Hardware Security Modules (HSM) for production**
3. **Implement certificate rotation policies**
4. **Monitor certificate expiration dates**
5. **Use separate CAs for different environments**

### Recommended Production Setup

```
Production Environment:
├── Certificate Authority (External/HSM)
│   ├── Root CA (Hardware-protected)
│   └── Intermediate CA (Hardware-protected)
├── OAuth Server
│   ├── signing-cert.pem (Public)
│   ├── signing-key.pem (Protected)
│   └── mtls-client-ca.pem (Public)
└── Client Applications
    ├── client-cert.pem (Public)
    └── client-key.pem (Protected)
```

## Certificate Validation

### Verify Certificate Integrity

```bash
# Check certificate details
openssl x509 -in signing-cert.pem -text -noout

# Verify certificate chain
openssl verify -CAfile mtls-client-ca.pem client-cert.pem

# Check certificate expiration
openssl x509 -in signing-cert.pem -noout -dates
```

## Environment-Specific Considerations

### Development Environment ✅

- Use self-signed certificates (like these)
- Store certificates in application directory
- Simple certificate management

### Testing Environment ⚠️

- Use dedicated test CA
- Implement certificate rotation testing
- Mirror production certificate structure

### Production Environment 🏭

- Use commercial or enterprise CA
- Hardware-protected private keys
- Automated certificate management
- Comprehensive monitoring and alerting

## Certificate Rotation

### Recommended Rotation Schedule

- **Token Signing Certificates**: Every 6 months
- **mTLS Client Certificates**: Every 12 months
- **CA Certificates**: Every 2-3 years

### Rotation Process

1. Generate new certificates
2. Update OAuth server configuration
3. Distribute new public certificates
4. Test thoroughly
5. Update client applications
6. Revoke old certificates

## Troubleshooting

### Common Issues

- **Certificate expired**: Check expiration dates
- **Certificate chain invalid**: Verify CA chain
- **Permission denied**: Check file permissions
- **Certificate mismatch**: Ensure correct certificate-key pairs

## Compliance and Standards

This implementation follows:

- **RFC 6749**: OAuth 2.0 Authorization Framework
- **RFC 8705**: OAuth 2.0 Mutual-TLS Client Authentication
- **RFC 7517**: JSON Web Key (JWK)
- **RFC 7519**: JSON Web Token (JWT)

## Support

For questions about certificate management or OAuth implementation, please refer to the OAuth 2.1 specification or contact your security team.

---

**Last Updated**: 2025-01-18  
**Version**: 1.0  
**Environment**: Development/Testing Only
