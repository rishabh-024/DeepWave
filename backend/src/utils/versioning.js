import { NotFoundError } from './errors.js';
import { logger } from './logger.js';

export class VersionMatcher {
  constructor() {
    this.versions = new Map();
    this.deprecated = new Set();
    this.defaultVersion = 'v1';
  }

  registerVersion(version, handler) {
    this.versions.set(version, handler);
    logger.debug(`Registered API version: ${version}`);
  }

  deprecateVersion(version, replacementVersion = null) {
    this.deprecated.add(version);
    if (replacementVersion) {
      this.versions.set(`${version}-deprecated`, {
        handler: this.versions.get(replacementVersion),
        redirectTo: replacementVersion,
      });
    }
    logger.warn(`Version deprecated: ${version}`);
    if (replacementVersion) {
      logger.info(`Users should migrate to: ${replacementVersion}`);
    }
  }

  getVersionFromRequest(req) {
    // Priority: Header > Query > URL > Default
    const version =
      req.headers['api-version'] ||
      req.query.version ||
      this.extractVersionFromUrl(req.path) ||
      this.defaultVersion;

    return version;
  }

  extractVersionFromUrl(path) {
    const match = path.match(/\/api\/(v\d+)/);
    return match ? match[1] : null;
  }

  isVersionSupported(version) {
    return this.versions.has(version) && !this.deprecated.has(version);
  }

  isVersionDeprecated(version) {
    return this.deprecated.has(version);
  }

  getHandler(version) {
    const handler = this.versions.get(version);
    if (!handler) {
      throw new NotFoundError(`API version not found: ${version}`);
    }
    return handler;
  }
}

export const versioningMiddleware = (versionMatcher) => {
  return (req, res, next) => {
    const clientVersion = versionMatcher.getVersionFromRequest(req);

    if (!versionMatcher.versions.has(clientVersion)) {
      logger.warn('Unsupported API version requested', {
        requestedVersion: clientVersion,
        path: req.path,
      });

      return res.status(400).json({
        status: 'error',
        message: `API version '${clientVersion}' is not supported`,
        supportedVersions: Array.from(versionMatcher.versions.keys()).filter(
          v => !versionMatcher.deprecated.has(v)
        ),
        defaultVersion: versionMatcher.defaultVersion,
      });
    }

    if (versionMatcher.isVersionDeprecated(clientVersion)) {
      logger.warn('Deprecated API version used', {
        version: clientVersion,
        ip: req.ip,
      });

      res.set('Deprecation', 'true');
      res.set('Sunset', new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toUTCString());
    }

    req.apiVersion = clientVersion;
    req.versionMatcher = versionMatcher;

    res.set('API-Version', clientVersion);

    next();
  };
};

export const versionTransformer = (defaultTransform) => {
  return (req, res, next) => {
    
    const originalJson = res.json.bind(res);

    res.json = (data) => {
      const transformed = applyVersionTransform(data, req.apiVersion, defaultTransform);
      return originalJson(transformed);
    };

    next();
  };
};

function applyVersionTransform(data, version, transforms) {
  if (!transforms || !transforms[version]) {
    return data;
  }

  const transform = transforms[version];
  if (typeof transform === 'function') {
    return transform(data);
  }

  return data;
}

export const versionedRoute = (versions = {}) => {
  return (req, res, next) => {
    const handler = versions[req.apiVersion];

    if (!handler) {
      return res.status(400).json({
        status: 'error',
        message: `Route not available for API version ${req.apiVersion}`,
      });
    }

    return handler(req, res, next);
  };
};

export const createVersionedResponse = (data, version, metadata = {}) => {
  return {
    status: 'success',
    version,
    timestamp: new Date(),
    data,
    ...metadata,
  };
};

export class APIVersionManager {
  constructor() {
    this.versions = new Map();
    this.migrations = new Map();
  }

  defineVersion(version, config = {}) {
    this.versions.set(version, {
      releaseDate: config.releaseDate || new Date(),
      deprecated: config.deprecated || false,
      sunsetDate: config.sunsetDate || null,
      features: config.features || [],
      changes: config.changes || [],
    });

    logger.info(`Defined API version: ${version}`, config);
  }

  defineMigration(fromVersion, toVersion, migrationFn) {
    const key = `${fromVersion}->${toVersion}`;
    this.migrations.set(key, migrationFn);
    logger.debug(`Defined migration: ${key}`);
  }

  async migrate(data, fromVersion, toVersion) {
    if (fromVersion === toVersion) {
      return data;
    }

    const key = `${fromVersion}->${toVersion}`;
    const migration = this.migrations.get(key);

    if (!migration) {
      throw new Error(
        `No migration path from ${fromVersion} to ${toVersion}`
      );
    }

    logger.debug(`Migrating data from ${fromVersion} to ${toVersion}`);
    return await migration(data);
  }

  getVersionInfo(version) {
    return this.versions.get(version) || null;
  }

  isSunset(version) {
    const versionInfo = this.getVersionInfo(version);
    if (!versionInfo || !versionInfo.sunsetDate) {
      return false;
    }
    return new Date() > new Date(versionInfo.sunsetDate);
  }

  getActiveVersions() {
    return Array.from(this.versions.entries())
      .filter(([_, info]) => !info.deprecated && !this.isSunset(_))
      .map(([version, _]) => version);
  }

  getDeprecationNotice(version) {
    const versionInfo = this.getVersionInfo(version);
    if (!versionInfo || !versionInfo.deprecated) {
      return null;
    }

    return {
      message: `API version ${version} is deprecated`,
      sunsetDate: versionInfo.sunsetDate,
      deprecatedSince: versionInfo.releaseDate,
      migrateToVersion: this.getLatestVersion(),
    };
  }

  getLatestVersion() {
    let latest = null;
    let latestDate = null;

    for (const [version, info] of this.versions) {
      if (!info.deprecated && !this.isSunset(version)) {
        const date = new Date(info.releaseDate);
        if (!latestDate || date > latestDate) {
          latest = version;
          latestDate = date;
        }
      }
    }

    return latest;
  }
}

export default {
  VersionMatcher,
  versioningMiddleware,
  versionTransformer,
  versionedRoute,
  createVersionedResponse,
  APIVersionManager,
};
