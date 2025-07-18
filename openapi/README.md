# OpenAPI Configuration Documentation

This document provides detailed information about all configuration parameters available in the OpenAPI service.

## Overview

The OpenAPI service configuration is defined in `openapi.yao` and includes:

- 🔧 **Base Configuration** - OpenAPI endpoint at `/openapi` with configurable providers
- 🔐 **OAuth 2.0 & 2.1 Support** - Configurable OAuth features with OAuth 2.1 enabled by default
- 🎫 **Multiple Token Formats** - JWT access tokens and opaque refresh tokens
- 🛡️ **Security Features** - mTLS, PKCE, rate limiting, and brute force protection
- 🏗️ **Advanced Flows** - Device flow, token exchange, and pushed authorization requests
- 🔄 **Token Management** - Token binding, revocation, and introspection capabilities

## Configuration Structure

```yaml
├── baseurl          # Base URL for OpenAPI endpoints (currently: "/openapi")
├── providers        # Data provider configuration
│   ├── user         # User provider model (default: "__yao.user")
│   ├── client       # Client store model (default: "__yao.oauth_client")
│   └── cache        # Cache store (default: "__yao.oauth_cache")
└── oauth
    └── config
        ├── issuer_url    # OAuth server issuer URL (required)
        ├── signing       # Token signing configuration
        ├── token         # Token lifecycle configuration
        ├── security      # Security features configuration
        ├── client        # Client default configuration
        └── features      # OAuth 2.0/2.1 feature flags
```

---

## Base Configuration

### `baseurl`

- **Type**: `string`
- **Required**: Yes
- **Default**: `/openapi`
- **Description**: Base URL path for OpenAPI endpoints

**Example:**

```json
"baseurl": "/oauth"
```

---

## Providers Configuration

### `providers`

Data provider configuration for OAuth service components.

#### `user`

- **Type**: `string`
- **Required**: Yes
- **Default**: `__yao.user`
- **Description**: User provider model for authentication and authorization
- **Custom**: Can be any Yao model with required fields

#### `client`

- **Type**: `string`
- **Required**: Yes
- **Default**: `__yao.oauth_client`
- **Description**: Client store for OAuth client registration and management
- **Custom**: Can be any Yao model for OAuth client data

#### `cache`

- **Type**: `string`
- **Required**: Yes
- **Default**: `__yao.oauth_cache`
- **Description**: Cache store for tokens, sessions, and temporary data
- **Custom**: Can be any Yao store (in-memory/Redis backend)

**Example:**

```json
"providers": {
  "user": "custom.users",
  "client": "oauth.clients",
  "cache": "redis.oauth_cache"
}
```

---

## OAuth Configuration

### Required Configuration

#### `issuer_url`

- **Type**: `string`
- **Required**: Yes
- **Description**: OAuth token issuer URL for OAuth server
- **Usage**: Used as the `iss` claim in JWT tokens

**Example:**

```json
"issuer_url": "https://localhost:5099"
```

---

## Signing Configuration

### Required Fields

#### `signing_cert_path`

- **Type**: `string`
- **Required**: Yes
- **Description**: Path to token signing certificate (public key)
- **Usage**: Used for JWT token verification

#### `signing_key_path`

- **Type**: `string`
- **Required**: Yes
- **Description**: Path to token signing private key
- **Usage**: Used for JWT token signing

### Optional Fields

#### `signing_key_password`

- **Type**: `string`
- **Required**: No
- **Default**: `""` (empty)
- **Description**: Password for encrypted private key

#### `signing_algorithm`

- **Type**: `string`
- **Required**: No
- **Default**: `RS256`
- **Options**: `RS256`, `RS384`, `RS512`, `ES256`, `ES384`, `ES512`
- **Description**: Token signing algorithm

#### `verification_certs`

- **Type**: `array[string]`
- **Required**: No
- **Default**: `[]` (empty)
- **Description**: Additional certificates for token verification

#### `mtls_client_ca_cert_path`

- **Type**: `string`
- **Required**: No
- **Description**: CA certificate path for mTLS client validation

#### `mtls_enabled`

- **Type**: `boolean`
- **Required**: No
- **Default**: `false`
- **Description**: Enable mutual TLS authentication

#### `cert_rotation_enabled`

- **Type**: `boolean`
- **Required**: No
- **Default**: `false`
- **Description**: Enable automatic certificate rotation

#### `cert_rotation_interval`

- **Type**: `string` (duration)
- **Required**: No
- **Default**: `24h`
- **Description**: Certificate rotation interval
- **Format**: Go duration format (e.g., `1h`, `30m`, `24h`)

---

## Token Configuration

### Access Token Settings

#### `access_token_lifetime`

- **Type**: `string` (duration)
- **Required**: No
- **Default**: `1h`
- **Description**: Access token validity period
- **Format**: Go duration format

#### `access_token_format`

- **Type**: `string`
- **Required**: No
- **Default**: `jwt`
- **Options**: `jwt`, `opaque`
- **Description**: Access token format

#### `access_token_signing_alg`

- **Type**: `string`
- **Required**: No
- **Default**: `RS256`
- **Description**: Access token signing algorithm (JWT only)

### Refresh Token Settings

#### `refresh_token_lifetime`

- **Type**: `string` (duration)
- **Required**: No
- **Default**: `24h`
- **Description**: Refresh token validity period

#### `refresh_token_rotation`

- **Type**: `boolean`
- **Required**: No
- **Default**: `false`
- **Description**: Enable refresh token rotation for OAuth 2.1

#### `refresh_token_format`

- **Type**: `string`
- **Required**: No
- **Default**: `opaque`
- **Options**: `opaque`, `jwt`
- **Description**: Refresh token format

### Authorization Code Settings

#### `authorization_code_lifetime`

- **Type**: `string` (duration)
- **Required**: No
- **Default**: `10m`
- **Description**: Authorization code validity period

#### `authorization_code_length`

- **Type**: `integer`
- **Required**: No
- **Default**: `32`
- **Description**: Authorization code length in bytes

### Device Flow Settings

#### `device_code_lifetime`

- **Type**: `string` (duration)
- **Required**: No
- **Default**: `15m`
- **Description**: Device code validity period

#### `device_code_length`

- **Type**: `integer`
- **Required**: No
- **Default**: `8`
- **Description**: Device code length in bytes

#### `user_code_length`

- **Type**: `integer`
- **Required**: No
- **Default**: `8`
- **Description**: User code length for device flow

#### `device_code_interval`

- **Type**: `string` (duration)
- **Required**: No
- **Default**: `5s`
- **Description**: Device code polling interval

### Token Binding Settings

#### `token_binding_enabled`

- **Type**: `boolean`
- **Required**: No
- **Default**: `false`
- **Description**: Enable token binding to client certificates

#### `supported_binding_types`

- **Type**: `array[string]`
- **Required**: No
- **Default**: `["dpop", "mtls"]`
- **Options**: `dpop`, `mtls`
- **Description**: Supported token binding types

### Audience Settings

#### `default_audience`

- **Type**: `array[string]`
- **Required**: No
- **Default**: `[]` (empty)
- **Description**: Default token audience

#### `audience_validation_mode`

- **Type**: `string`
- **Required**: No
- **Default**: `strict`
- **Options**: `strict`, `relaxed`
- **Description**: Audience validation mode

---

## Security Configuration

### PKCE Settings

#### `pkce_required`

- **Type**: `boolean`
- **Required**: No
- **Default**: `true`
- **Description**: Require PKCE for OAuth 2.1 compliance

#### `pkce_code_challenge_method`

- **Type**: `array[string]`
- **Required**: No
- **Default**: `["S256"]`
- **Options**: `S256`, `plain`
- **Description**: Supported PKCE code challenge methods

#### `pkce_code_verifier_length`

- **Type**: `integer`
- **Required**: No
- **Default**: `128`
- **Description**: PKCE code verifier length

### State Parameter Settings

#### `state_parameter_required`

- **Type**: `boolean`
- **Required**: No
- **Default**: `false`
- **Description**: Require state parameter for CSRF protection

#### `state_parameter_lifetime`

- **Type**: `string` (duration)
- **Required**: No
- **Default**: `10m`
- **Description**: State parameter validity period

#### `state_parameter_length`

- **Type**: `integer`
- **Required**: No
- **Default**: `32`
- **Description**: State parameter length in bytes

### Rate Limiting

#### `rate_limit_enabled`

- **Type**: `boolean`
- **Required**: No
- **Default**: `false`
- **Description**: Enable rate limiting

#### `rate_limit_requests`

- **Type**: `integer`
- **Required**: No
- **Default**: `100`
- **Description**: Number of requests per window

#### `rate_limit_window`

- **Type**: `string` (duration)
- **Required**: No
- **Default**: `1m`
- **Description**: Rate limit time window

#### `rate_limit_by_client_id`

- **Type**: `boolean`
- **Required**: No
- **Default**: `false`
- **Description**: Enable per-client rate limiting

### Brute Force Protection

#### `brute_force_protection_enabled`

- **Type**: `boolean`
- **Required**: No
- **Default**: `false`
- **Description**: Enable brute force attack protection

#### `max_failed_attempts`

- **Type**: `integer`
- **Required**: No
- **Default**: `5`
- **Description**: Maximum failed login attempts

#### `lockout_duration`

- **Type**: `string` (duration)
- **Required**: No
- **Default**: `15m`
- **Description**: Account lockout duration

### Encryption Settings

#### `encryption_key`

- **Type**: `string`
- **Required**: No
- **Default**: `""` (empty)
- **Description**: Key for encrypting sensitive data

#### `encryption_algorithm`

- **Type**: `string`
- **Required**: No
- **Default**: `AES-256-GCM`
- **Description**: Encryption algorithm for sensitive data

### Network Security

#### `ip_whitelist`

- **Type**: `array[string]`
- **Required**: No
- **Default**: `[]` (empty)
- **Description**: IP addresses allowed to access

#### `ip_blacklist`

- **Type**: `array[string]`
- **Required**: No
- **Default**: `[]` (empty)
- **Description**: IP addresses blocked from access

#### `require_https`

- **Type**: `boolean`
- **Required**: No
- **Default**: `true`
- **Description**: Require HTTPS for all endpoints

#### `disable_unsecure_endpoints`

- **Type**: `boolean`
- **Required**: No
- **Default**: `false`
- **Description**: Disable non-HTTPS endpoints

---

## Client Configuration

### Default Client Settings

#### `default_client_type`

- **Type**: `string`
- **Required**: No
- **Default**: `confidential`
- **Options**: `confidential`, `public`
- **Description**: Default client type

#### `default_token_endpoint_auth_method`

- **Type**: `string`
- **Required**: No
- **Default**: `client_secret_basic`
- **Options**: `client_secret_basic`, `client_secret_post`, `client_secret_jwt`, `private_key_jwt`, `none`
- **Description**: Default client authentication method

#### `default_grant_types`

- **Type**: `array[string]`
- **Required**: No
- **Default**: `["authorization_code", "refresh_token"]`
- **Options**: `authorization_code`, `refresh_token`, `client_credentials`, `device_code`
- **Description**: Default supported grant types

#### `default_response_types`

- **Type**: `array[string]`
- **Required**: No
- **Default**: `["code"]`
- **Options**: `code`, `token`, `id_token`
- **Description**: Default supported response types

#### `default_scopes`

- **Type**: `array[string]`
- **Required**: No
- **Default**: `["openid", "profile", "email"]`
- **Description**: Default OAuth scopes

### Client Validation Settings

#### `client_id_length`

- **Type**: `integer`
- **Required**: No
- **Default**: `32`
- **Description**: Client ID length in bytes

#### `client_secret_length`

- **Type**: `integer`
- **Required**: No
- **Default**: `64`
- **Description**: Client secret length in bytes

#### `client_secret_lifetime`

- **Type**: `string` (duration)
- **Required**: No
- **Default**: `0s` (never expires)
- **Description**: Client secret lifetime

### Dynamic Registration

#### `dynamic_registration_enabled`

- **Type**: `boolean`
- **Required**: No
- **Default**: `true`
- **Description**: Enable dynamic client registration

#### `allowed_redirect_uri_schemes`

- **Type**: `array[string]`
- **Required**: No
- **Default**: `["https", "http"]`
- **Description**: Allowed redirect URI schemes

#### `allowed_redirect_uri_hosts`

- **Type**: `array[string]`
- **Required**: No
- **Default**: `["localhost", "127.0.0.1"]`
- **Description**: Allowed redirect URI hosts

### Client Certificate Settings

#### `client_certificate_required`

- **Type**: `boolean`
- **Required**: No
- **Default**: `false`
- **Description**: Require client certificates

#### `client_certificate_validation`

- **Type**: `string`
- **Required**: No
- **Default**: `none`
- **Options**: `none`, `optional`, `required`
- **Description**: Client certificate validation mode

---

## Features Configuration

### OAuth 2.1 Features

#### `oauth21_enabled`

- **Type**: `boolean`
- **Required**: No
- **Default**: `true`
- **Description**: Enable OAuth 2.1 features

#### `pkce_enforced`

- **Type**: `boolean`
- **Required**: No
- **Default**: `true`
- **Description**: Enforce PKCE for all clients

#### `refresh_token_rotation_enabled`

- **Type**: `boolean`
- **Required**: No
- **Default**: `true`
- **Description**: Enable refresh token rotation

### Advanced Flows

#### `device_flow_enabled`

- **Type**: `boolean`
- **Required**: No
- **Default**: `true`
- **Description**: Enable device authorization flow

#### `token_exchange_enabled`

- **Type**: `boolean`
- **Required**: No
- **Default**: `false`
- **Description**: Enable token exchange (RFC 8693)

#### `pushed_authorization_enabled`

- **Type**: `boolean`
- **Required**: No
- **Default**: `false`
- **Description**: Enable pushed authorization requests (RFC 9126)

#### `dynamic_client_registration_enabled`

- **Type**: `boolean`
- **Required**: No
- **Default**: `true`
- **Description**: Enable dynamic client registration (RFC 7591)

### Protocol Compliance

#### `mcp_compliance_enabled`

- **Type**: `boolean`
- **Required**: No
- **Default**: `false`
- **Description**: Enable MCP (Model Context Protocol) compliance

#### `resource_parameter_enabled`

- **Type**: `boolean`
- **Required**: No
- **Default**: `false`
- **Description**: Enable resource parameter support

### Security Features

#### `token_binding_enabled`

- **Type**: `boolean`
- **Required**: No
- **Default**: `false`
- **Description**: Enable token binding to client certificates

#### `mtls_enabled`

- **Type**: `boolean`
- **Required**: No
- **Default**: `false`
- **Description**: Enable mutual TLS authentication

#### `dpop_enabled`

- **Type**: `boolean`
- **Required**: No
- **Default**: `false`
- **Description**: Enable DPoP (Demonstration of Proof-of-Possession)

### Token Management

#### `jwt_introspection_enabled`

- **Type**: `boolean`
- **Required**: No
- **Default**: `true`
- **Description**: Enable JWT token introspection

#### `token_revocation_enabled`

- **Type**: `boolean`
- **Required**: No
- **Default**: `true`
- **Description**: Enable token revocation (RFC 7009)

#### `userinfo_jwt_enabled`

- **Type**: `boolean`
- **Required**: No
- **Default**: `false`
- **Description**: Enable JWT format for UserInfo responses

---

## Configuration Examples

### Minimal Configuration

```json
{
  "baseurl": "/oauth",
  "providers": {
    "user": "__yao.user",
    "client": "__yao.oauth_client",
    "cache": "__yao.oauth_cache"
  },
  "oauth": {
    "config": {
      "issuer_url": "https://localhost:5099",
      "signing": {
        "signing_cert_path": "certs/signing-cert.pem",
        "signing_key_path": "certs/signing-key.pem"
      }
    }
  }
}
```

### Production Configuration

```json
{
  "baseurl": "/oauth",
  "providers": {
    "user": "__yao.user",
    "client": "__yao.oauth_client",
    "cache": "__yao.oauth_cache"
  },
  "oauth": {
    "config": {
      "issuer_url": "https://localhost:5099",
      "signing": {
        "signing_cert_path": "certs/signing-cert.pem",
        "signing_key_path": "certs/signing-key.pem",
        "mtls_enabled": true,
        "mtls_client_ca_cert_path": "certs/mtls-client-ca.pem"
      },
      "token": {
        "access_token_lifetime": "30m",
        "refresh_token_rotation": true
      },
      "security": {
        "pkce_required": true,
        "rate_limit_enabled": true,
        "brute_force_protection_enabled": true,
        "require_https": true
      },
      "features": {
        "oauth21_enabled": true,
        "token_revocation_enabled": true,
        "jwt_introspection_enabled": true
      }
    }
  }
}
```

### High-Security Configuration

```json
{
  "baseurl": "/oauth",
  "providers": {
    "user": "__yao.user",
    "client": "__yao.oauth_client",
    "cache": "__yao.oauth_cache"
  },
  "oauth": {
    "config": {
      "issuer_url": "https://localhost:5099",
      "signing": {
        "signing_cert_path": "certs/signing-cert.pem",
        "signing_key_path": "certs/signing-key.pem",
        "mtls_enabled": true,
        "mtls_client_ca_cert_path": "certs/mtls-client-ca.pem"
      },
      "token": {
        "access_token_lifetime": "15m",
        "refresh_token_rotation": true,
        "token_binding_enabled": true,
        "supported_binding_types": ["mtls", "dpop"]
      },
      "security": {
        "pkce_required": true,
        "state_parameter_required": true,
        "rate_limit_enabled": true,
        "brute_force_protection_enabled": true,
        "require_https": true,
        "disable_unsecure_endpoints": true
      },
      "client": {
        "client_certificate_required": true,
        "client_certificate_validation": "required"
      },
      "features": {
        "oauth21_enabled": true,
        "pkce_enforced": true,
        "mtls_enabled": true,
        "dpop_enabled": true,
        "token_binding_enabled": true,
        "pushed_authorization_enabled": true
      }
    }
  }
}
```

---

## Best Practices

### Security Recommendations

1. **Always use HTTPS** in production
2. **Enable PKCE** for all clients
3. **Use short-lived access tokens** (15-30 minutes)
4. **Enable refresh token rotation**
5. **Implement rate limiting**
6. **Use mTLS** for high-security environments
7. **Enable brute force protection**
8. **Regularly rotate certificates**

### Performance Optimization

1. **Use opaque refresh tokens** for better revocation control
2. **Configure appropriate token lifetimes**
3. **Enable caching** for frequently accessed data
4. **Use JWT access tokens** for stateless validation
5. **Implement proper rate limiting**

### Monitoring and Logging

1. Enable comprehensive logging
2. Monitor token usage patterns
3. Track failed authentication attempts
4. Set up alerts for security events
5. Regularly audit client configurations

---

## Troubleshooting

### Common Issues

#### Certificate Problems

- Ensure certificate paths are correct
- Check certificate permissions
- Verify certificate validity dates
- Confirm certificate format (PEM)

#### Token Issues

- Check token lifetimes
- Verify signing algorithm compatibility
- Ensure proper audience configuration
- Confirm token format settings

#### Client Configuration

- Verify redirect URI configuration
- Check client authentication method
- Ensure proper grant type settings
- Confirm scope configuration

### Debug Mode

Enable debug logging by setting appropriate log levels in your Yao application configuration.

---

## RFC References

- [RFC 6749](https://tools.ietf.org/html/rfc6749) - OAuth 2.0 Authorization Framework
- [RFC 6750](https://tools.ietf.org/html/rfc6750) - OAuth 2.0 Bearer Token Usage
- [RFC 7009](https://tools.ietf.org/html/rfc7009) - OAuth 2.0 Token Revocation
- [RFC 7515](https://tools.ietf.org/html/rfc7515) - JSON Web Signature (JWS)
- [RFC 7517](https://tools.ietf.org/html/rfc7517) - JSON Web Key (JWK)
- [RFC 7519](https://tools.ietf.org/html/rfc7519) - JSON Web Token (JWT)
- [RFC 7523](https://tools.ietf.org/html/rfc7523) - JSON Web Token Profile for OAuth 2.0
- [RFC 7591](https://tools.ietf.org/html/rfc7591) - OAuth 2.0 Dynamic Client Registration
- [RFC 7636](https://tools.ietf.org/html/rfc7636) - PKCE for OAuth 2.0
- [RFC 8414](https://tools.ietf.org/html/rfc8414) - OAuth 2.0 Authorization Server Metadata
- [RFC 8693](https://tools.ietf.org/html/rfc8693) - OAuth 2.0 Token Exchange
- [RFC 8705](https://tools.ietf.org/html/rfc8705) - OAuth 2.0 Mutual-TLS Client Authentication
- [RFC 9126](https://tools.ietf.org/html/rfc9126) - OAuth 2.0 Pushed Authorization Requests
- [OAuth 2.1](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1) - OAuth 2.1 Authorization Framework
