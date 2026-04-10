import fetch, { FormData } from 'node-fetch';
import { ExternalServiceError } from './errors.js';
import logger from './logger.js';

const isAbsoluteUrl = (value = '') => /^https?:\/\//i.test(value);

const buildUrl = (baseURL = '', url = '') => {
  if (isAbsoluteUrl(url) || !baseURL) {
    return url || baseURL;
  }

  return `${baseURL.replace(/\/+$/, '')}/${String(url).replace(/^\/+/, '')}`;
};

const isPlainObject = (value) => (
  value !== null &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  !Buffer.isBuffer(value) &&
  !(value instanceof FormData) &&
  !(value instanceof URLSearchParams)
);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class HttpClient {
  constructor(baseURL = '', options = {}) {
    this.baseURL = baseURL;
    this.timeout = options.timeout || 10000;
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000;
    this.retryStatusCodes = options.retryStatusCodes || [408, 429, 500, 502, 503, 504];
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'User-Agent': 'DeepWave-Backend/1.0.0',
      ...(options.headers || {}),
    };
  }

  isRetryable(error) {
    if (!error.response) {
      return true;
    }

    return this.retryStatusCodes.includes(error.response.status);
  }

  getRetryDelay(retryCount) {
    return this.retryDelay * Math.pow(2, retryCount);
  }

  async get(url, config = {}) {
    return this.request('GET', url, null, config);
  }

  async post(url, data = {}, config = {}) {
    return this.request('POST', url, data, config);
  }

  async put(url, data = {}, config = {}) {
    return this.request('PUT', url, data, config);
  }

  async patch(url, data = {}, config = {}) {
    return this.request('PATCH', url, data, config);
  }

  async delete(url, config = {}) {
    return this.request('DELETE', url, null, config);
  }

  async request(method, url, data = null, config = {}) {
    let lastError;
    let retryCount = 0;
    const finalUrl = buildUrl(this.baseURL, url);

    while (retryCount <= this.maxRetries) {
      const controller = new AbortController();
      const timeoutMs = config.timeout || this.timeout;
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const headers = {
          ...this.defaultHeaders,
          ...(config.headers || {}),
        };

        let body;
        if (data !== null && data !== undefined) {
          if (
            data instanceof FormData ||
            data instanceof URLSearchParams ||
            Buffer.isBuffer(data) ||
            typeof data === 'string'
          ) {
            body = data;
            delete headers['Content-Type'];
          } else if (isPlainObject(data)) {
            body = JSON.stringify(data);
          } else {
            body = data;
          }
        }

        if (method === 'GET' || method === 'HEAD') {
          delete headers['Content-Type'];
        }

        const startedAt = Date.now();
        const response = await fetch(finalUrl, {
          method,
          headers,
          body,
          signal: controller.signal,
        });

        const duration = Date.now() - startedAt;
        const contentType = response.headers.get('content-type') || '';
        const isJson = contentType.includes('application/json');

        let payload = null;
        if (response.status !== 204) {
          payload = isJson ? await response.json() : await response.text();
        }

        if (!response.ok) {
          const error = new Error(
            payload?.error?.message ||
            payload?.message ||
            response.statusText ||
            'Request failed'
          );
          error.response = {
            status: response.status,
            data: payload,
          };
          throw error;
        }

        logger.debug('HTTP request successful', {
          method,
          url: finalUrl,
          status: response.status,
          durationMs: duration,
        });

        clearTimeout(timeoutId);
        return payload;
      } catch (error) {
        clearTimeout(timeoutId);

        lastError = error;
        if (error.name === 'AbortError') {
          lastError = new Error(`Request timeout after ${timeoutMs}ms`);
        }

        if (!this.isRetryable(lastError) || retryCount >= this.maxRetries) {
          break;
        }

        const delay = this.getRetryDelay(retryCount);
        logger.warn('HTTP request failed, retrying...', {
          method,
          url: finalUrl,
          status: lastError.response?.status,
          retryCount,
          delayMs: delay,
        });

        await sleep(delay);
        retryCount += 1;
      }
    }

    logger.error('HTTP request failed after retries', {
      method,
      url: finalUrl,
      status: lastError?.response?.status,
      message: lastError?.message,
      retries: retryCount,
    });

    throw new ExternalServiceError('HTTP request', `Failed to reach ${finalUrl}`, {
      method,
      statusCode: lastError?.response?.status,
      message: lastError?.message,
      retries: retryCount,
    });
  }

  async batch(requests, concurrency = 5) {
    const results = [];
    const errors = [];

    for (let i = 0; i < requests.length; i += concurrency) {
      const batch = requests.slice(i, i + concurrency);

      try {
        const batchResults = await Promise.all(
          batch.map((req) => this.request(req.method, req.url, req.data, req.config))
        );
        results.push(...batchResults);
      } catch (error) {
        errors.push({
          index: i,
          error: error.message,
        });
      }
    }

    return {
      results,
      errors,
      success: errors.length === 0,
    };
  }

  async stream(url, config = {}) {
    const response = await fetch(buildUrl(this.baseURL, url), {
      method: 'GET',
      headers: {
        ...this.defaultHeaders,
        ...(config.headers || {}),
      },
      signal: config.signal,
    });

    if (!response.ok) {
      throw new ExternalServiceError('HTTP stream', `Failed to stream from ${buildUrl(this.baseURL, url)}`, {
        statusCode: response.status,
      });
    }

    return response;
  }

  async uploadFile(url, fileStream, filename, config = {}) {
    const formData = new FormData();
    formData.append('file', fileStream, filename);

    return this.request('POST', url, formData, {
      ...config,
      headers: {
        ...(config.headers || {}),
      },
    });
  }
}

export class NLPServiceClient extends HttpClient {
  constructor(baseURL, options = {}) {
    super(baseURL, {
      timeout: 15000,
      maxRetries: 2,
      ...options,
    });
  }

  async analyzeMood(text) {
    try {
      return await this.post('/analyze', {
        text,
        type: 'mood',
      });
    } catch (error) {
      logger.error('NLP mood analysis failed', { error: error.message });
      throw error;
    }
  }

  async analyzeSentiment(text) {
    try {
      return await this.post('/analyze', {
        text,
        type: 'sentiment',
      });
    } catch (error) {
      logger.error('NLP sentiment analysis failed', { error: error.message });
      throw error;
    }
  }

  async getRecommendations(analysisResult) {
    try {
      return await this.post('/recommend', analysisResult);
    } catch (error) {
      logger.error('Failed to get NLP recommendations', { error: error.message });
      throw error;
    }
  }

  async healthCheck() {
    try {
      const healthz = await this.get('/healthz');
      return healthz?.ok ? { status: 'healthy', ...healthz } : { status: 'healthy' };
    } catch (error) {
      logger.warn('Primary NLP health endpoint failed, falling back to /health', {
        error: error.message,
      });
    }

    try {
      return await this.get('/health');
    } catch (error) {
      logger.error('NLP service health check failed', { error: error.message });
      return { status: 'unavailable' };
    }
  }
}

export const createHttpClient = (baseURL, options = {}) => {
  return new HttpClient(baseURL, options);
};

export const createNLPClient = (baseURL, options = {}) => {
  return new NLPServiceClient(baseURL, options);
};

export default HttpClient;
