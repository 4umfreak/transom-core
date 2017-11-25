'use strict';

const debug = require('debug')('transom:core');
const favicon = require('serve-favicon');
const path = require('path');
const restify = require('restify');
const restifyPlugins = require('restify').plugins;
const PocketRegistry = require('pocket-registry');
const corsMiddleware = require('restify-cors-middleware');

function TransomCore() {

	const plugins = [];

	this.configure = function (plugin, options) {
		debug('Adding Transom plugin:', plugin.constructor.name);
		options = options || {};
		plugins.push({
			plugin,
			options
		});
	};

	this.initialize = function (server, options) {
		// Allow users to create their own Server & pass it in along with an options object.
		if (!options) {
			debug('Creating new Restify server');
			options = server || {};
			server = restify.createServer();
		}

		// Put the transom configuration and API definition into a global registry.
		server.registry = new PocketRegistry();
		server.registry.set('transom-config', options);

		// Setup a Bunyan logger with request details.
		const requestLoggerOpts = server.registry.get('transom-config.transom.requestLogger', {});
		if (requestLoggerOpts) {
			debug('Adding Restify RequestLogger plugin');
			server.use(restifyPlugins.requestLogger(requestLoggerOpts));
		}

		// Use CORS for handling cross-domain ajax requests.
		const corsOptions = server.registry.get('transom-config.transom.cors', {});
		if (corsOptions) {
			debug('Adding CORS handling');
			// Get an array of valid domain names for CORS and handle OPTIONS requests.
			corsOptions.origins = corsOptions.origins || ['*'];
			corsOptions.allowHeaders = (corsOptions.allowHeaders || []).concat(['authorization']);

			const cors = corsMiddleware(corsOptions);
			server.pre(cors.preflight);
			server.use(cors.actual);
		}

		// Parse body parameters into the req.params object.
		const bodyOpts = server.registry.get('transom-config.transom.bodyParser', {});
		if (bodyOpts) {
			debug('Adding Restify BodyParser plugin');
			bodyOpts.mapParams = (bodyOpts.mapParams === undefined) ? true : bodyOpts.mapParams; // default true
			bodyOpts.limit = (bodyOpts.limit === undefined) ? 20000 : bodyOpts.limit; // default 20000
			server.use(restifyPlugins.bodyParser(bodyOpts));
		}

		// Parse query parameters into the req.params object.
		const queryOpts = server.registry.get('transom-config.transom.queryParser', {});
		if (queryOpts) {
			debug('Adding Restify QueryParser plugin');
			queryOpts.mapParams = (queryOpts.mapParams === undefined) ? true : queryOpts.mapParams; // default true
			server.use(restifyPlugins.queryParser(queryOpts));
		}

		// Parse url-encoded forms into the req.params object.
		const encBodyOpts = server.registry.get('transom-config.transom.urlEncodedBodyParser', {});
		if (encBodyOpts) {
			debug('Adding Restify UrlEncodedBodyParser plugin');
			encBodyOpts.mapParams = (encBodyOpts.mapParams === undefined) ? true : encBodyOpts.mapParams; // default true
			server.use(restifyPlugins.urlEncodedBodyParser(encBodyOpts));
		}

		// Compress API responses with gzip.
		const gzipOpts = server.registry.get('transom-config.transom.gzipResponse', {});
		if (gzipOpts) {
			debug('Adding Restify GzipResponse plugin');
			server.use(restifyPlugins.gzipResponse(gzipOpts));
		}

		// Use fullResponse, adding a bunch of Headers to the response.
		const fullOpts = server.registry.get('transom-config.transom.fullResponse', {});
		if (fullOpts) {
			debug('Adding Restify FullResponse plugin');
			server.use(restifyPlugins.fullResponse(fullOpts));
		}

		// Provide a transom icon for API GET requests from a browser.
		const faviconOpts = server.registry.get('transom-config.transom.favicon', {});
		if (faviconOpts) {
			debug('Adding Favicon support');
			faviconOpts.path = faviconOpts.path || path.join(__dirname, 'images', 'favicon.ico');
			server.use(favicon(faviconOpts.path));
		}

		// Create req.locals *before* initializing all our plugins!
		server.use(function (req, res, next) {
			debug('Initializing req.locals and req.session');
			req.locals = req.locals || {}; // Required by many of our API methods.
			req.session = req.session || {}; // required by FacebookStrategy.
			next();
		});

		// Configure each registered plugin, in the order they've been added.
		for (const each of plugins) {
			try {
				debug('Initializing Transom plugin:', each.plugin.constructor.name);
				each.plugin.initialize(server, each.options);
			} catch (err) {
				debug("Transom core initialize failed!", err);
				throw err;
			}
		}
		return server;
	};
};

module.exports = TransomCore;