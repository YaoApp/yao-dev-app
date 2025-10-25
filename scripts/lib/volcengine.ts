/**
 * Volcengine OpenAPI SDK
 */
import { Exception, http, Process } from "@yao/runtime";

export class Volcengine {
  private AccessKeyId: string;
  private SecretAccessKey: string;
  private Region: string;
  private Service: string;
  private Endpoint: string;
  constructor(option: Option) {
    this.AccessKeyId = option.AccessKeyId;
    this.SecretAccessKey = option.SecretAccessKey;
    this.Region = option.Region;
    this.Service = option.Service;
    this.Endpoint = option.Endpoint
      ? `https://${option.Endpoint}`
      : `https://${this.Service}.${this.Region}.volcengineapi.com`;
  }

  public Get(query: Record<string, string>) {
    const url = this.Endpoint;
    const host = url.split("://")[1].split("/")[0];
    const headers = { host: host };
    const request: Request = {
      Method: "GET",
      URI: "/",
      Query: query,
      Headers: headers,
      Payload: null,
    };

    const auth = this.getAuthorization(request);

    // Add authorization header
    headers["Authorization"] = auth;
    headers["Content-Type"] = "application/json";

    const resp = http.Get(url, query, headers);
    if (resp.code > 299 || resp.code < 200) {
      const { ResponseMetadata } = resp.data || {};
      const { Error } = ResponseMetadata || {};
      const message =
        Error?.Message || (resp.code === 0 ? resp.message : "Unknown error");
      throw new Exception(message, resp.code);
    }

    return resp.data;
  }

  /**
   * Post request
   * @param query Query parameters
   * @param payload Payload
   * @returns Response
   */
  public Post(query: Record<string, string>, payload: Record<string, any>) {
    const url = this.Endpoint;
    const host = url.split("://")[1].split("/")[0];
    const headers = { host: host };
    const body = JSON.stringify(payload);
    const request: Request = {
      Method: "POST",
      URI: "/",
      Query: query,
      Headers: headers,
      Payload: body,
    };

    const auth = this.getAuthorization(request);
    headers["Authorization"] = auth;
    headers["Content-Type"] = "application/json";

    const resp = http.Post(url, body, null, query, headers);
    if (resp.code > 299 || resp.code < 200) {
      const { ResponseMetadata } = resp.data || {};
      const { Error } = ResponseMetadata || {};
      const message =
        Error?.Message || (resp.code === 0 ? resp.message : "Unknown error");
      throw new Exception(message, resp.code);
    }
    return resp.data;
  }

  /**
   * Create a canonical request
   * @param request Request object
   * @returns Canonical request string
   */
  private canonicalRequest(request: Request): string {
    const xDate = this.formatDate(new Date());

    // 1. HTTP Method
    const method = request.Method;

    // 2. URI (default to '/' if null)
    const uri = request.URI || "/";

    // 3. Query String
    let queryString = "";
    if (request.Query) {
      if (Array.isArray(request.Query)) {
        // Handle array of query parameters
        const queryParams = request.Query.reduce((acc: string[], curr) => {
          Object.entries(curr).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== "") {
              acc.push(
                `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
              );
            }
          });
          return acc;
        }, []);
        queryString = queryParams.sort().join("&");
      } else {
        // Handle single query object
        const queryParams = Object.entries(request.Query)
          .filter(
            ([_, value]) =>
              value !== null && value !== undefined && value !== ""
          )
          .map(
            ([key, value]) =>
              `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
          )
          .sort();
        queryString = queryParams.join("&");
      }
    }

    // 4. Headers
    // First, collect all headers in a normalized format
    const headers: Record<string, string> = { "x-date": xDate };
    if (request.Headers) {
      if (Array.isArray(request.Headers)) {
        request.Headers.forEach((headerObj) => {
          Object.entries(headerObj).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value.trim() !== "") {
              headers[key.toLowerCase()] = value.trim();
            }
          });
        });
      } else {
        Object.entries(request.Headers).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value.trim() !== "") {
            headers[key.toLowerCase()] = value.trim();
          }
        });
      }
    }

    // Get required headers if they exist
    const signedHeaderKeys: string[] = [];
    const requiredHeaders = ["host", "x-date"];

    // Add required headers first if they exist
    requiredHeaders.forEach((key) => {
      if (headers[key]) {
        signedHeaderKeys.push(key);
      }
    });

    // Add any additional headers
    // const additionalHeaders = Object.keys(headers)
    //   .filter((key) => !requiredHeaders.includes(key))
    //   .sort();
    // signedHeaderKeys.push(...additionalHeaders);

    // Build canonical headers string
    const canonicalHeaders = signedHeaderKeys
      .map((key) => `${key}:${headers[key]}`)
      .join("\n");

    // Build signed headers string
    const signedHeaders = signedHeaderKeys.join(";");

    // 5. Payload/Body
    let hashedPayload = Process("crypto.Hash", "SHA256", "");
    if (request.Payload !== null && request.Payload !== undefined) {
      if (typeof request.Payload === "string") {
        if (request.Payload !== "") {
          hashedPayload = Process("crypto.Hash", "SHA256", request.Payload);
        }
      } else {
        const payload = JSON.stringify(request.Payload);
        if (payload !== "{}" && payload !== "[]") {
          hashedPayload = Process("crypto.Hash", "SHA256", payload);
        }
      }
    }

    // Combine all components
    const parts = [
      method,
      uri,
      queryString,
      canonicalHeaders,
      "", // Empty line after headers
      signedHeaders,
      hashedPayload,
    ];

    return parts.join("\n");
  }

  /**
   * Format date to YYYYMMDDTHHMMSSZ
   * @param date Date object
   * @returns Formatted date string
   */
  private formatDate(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    const seconds = String(date.getUTCSeconds()).padStart(2, "0");
    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
  }

  /**
   * Create string to sign
   * @param canonicalRequest Canonical request string
   * @returns String to sign
   */
  private stringToSign(canonicalRequest: string): string {
    const algorithm = "HMAC-SHA256";
    const requestDateTime = this.formatDate(new Date());
    const requestDate = requestDateTime.slice(0, 8);
    const credentialScope = `${requestDate}/${this.Region}/${this.Service}/request`; // YYYYMMDD

    const hashedCanonicalRequest = Process(
      "crypto.Hash",
      "SHA256",
      canonicalRequest
    );

    return `${algorithm}\n${requestDateTime}\n${credentialScope}\n${hashedCanonicalRequest}`;
  }

  /**
   * Derive signing key
   * @param date Date in YYYY/MM/DD format
   * @returns Signing key
   */
  private getSigningKey(date: string): string {
    const kDate = Process("crypto.HMAC", "SHA256", date, this.SecretAccessKey);
    const kRegion = Process(
      "crypto.HMACWith",
      { key: "hex" },
      this.Region,
      kDate
    );
    const kService = Process(
      "crypto.HMACWith",
      { key: "hex" },
      this.Service,
      kRegion
    );

    const kSigning = Process(
      "crypto.HMACWith",
      { key: "hex" },
      "request",
      kService
    );
    return kSigning;
  }

  /**
   * Calculate signature
   * @param stringToSign String to sign
   * @param signingKey Signing key
   * @returns Signature
   */
  private signature(stringToSign: string, signingKey: string): string {
    return Process("crypto.HMACWith", { key: "hex" }, stringToSign, signingKey);
  }

  /**
   * Build authorization header
   * @param request Request object
   * @returns Authorization header value
   */
  public getAuthorization(request: Request): string {
    const xDate = this.formatDate(new Date());
    if (request.Headers) {
      if (typeof request.Headers === "object") {
        request.Headers["x-date"] = request.Headers["x-date"]
          ? request.Headers["x-date"]
          : xDate;
      }
    }

    // 1. Create canonical request
    const canonicalReq = this.canonicalRequest(request);

    // 2. Create string to sign
    const stringToSign = this.stringToSign(canonicalReq);

    // 3. Get date from string to sign
    const [algorithm, requestDateTime, credentialScope] =
      stringToSign.split("\n");
    const date = requestDateTime.slice(0, 8);

    // 4. Derive signing key
    const signingKey = this.getSigningKey(date);
    // 5. Calculate signature
    const signature = this.signature(stringToSign, signingKey);

    // 6. Build authorization header
    let signedHeaders = "";
    if (request.Headers) {
      const headers: Record<string, string> = {};
      if (Array.isArray(request.Headers)) {
        request.Headers.forEach((headerObj) => {
          Object.entries(headerObj).forEach(([key, value]) => {
            headers[key.toLowerCase()] = value.trim();
          });
        });
      } else {
        Object.entries(request.Headers).forEach(([key, value]) => {
          headers[key.toLowerCase()] = value.trim();
        });
      }
      signedHeaders = Object.keys(headers).sort().join(";");
    }

    return `${algorithm} Credential=${this.AccessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  }
}

export interface Option {
  AccessKeyId: string;
  SecretAccessKey: string;
  Endpoint?: string;
  Region: string;
  Service: string;
}

export interface Request {
  Method: "GET" | "POST";
  URI: string | null; // Default /
  Query: Record<string, string> | Record<string, string>[] | null;
  Headers: Record<string, string> | Record<string, string>[] | null;
  Payload: string | Record<string, any> | any[] | null;
}
