/*global SC*/
SC.Manager = (function (SC, p) {
	"use strict";

	var Manager,
		store = new SC.Store(),
		normalizer = new SC.Normalizer();

	/**
	 * @type {Window}
	 * @public
	 */
	SC._default = window;

	/**
	 * Manager
	 * @param {boolean} isStatic
	 * @constructor
	 */
	Manager = function (isStatic) {
		/** @type {Object}*/
		this.context = SC._default;
		/** @type {boolean}*/
		this.isStatic = isStatic || false;
	};

	p = Manager.prototype;

	/**
	 * Create new ShortcutManager
	 * @param {Object} context
	 * @returns {Manager}
	 */
	p.create = function (context) {
		return new SC.Manager().in(context);
	};

	/**
	 * Set context
	 * @param {Object} context
	 * @returns {Manager}
	 */
	p.in = function (context) {
		if (this.isStatic) {
			throw "ShortcutManager: Can not change context on static method. Use ShortcutManager.create() with right context.";
		}

		this.context = context;

		return this;
	};

	/**
	 * Register new shortcut
	 * @param {string} shortcut
	 * @param {function} handler
	 * @param {boolean} isDefault indicates default handler (can be overridden)
	 */
	p.on = function (shortcut, handler, isDefault) {
		var normalized = normalizer.normalize(shortcut);

		store.save(normalized, this.context, handler, isDefault);
	};

	/**
	 * Removes handlers by context, shortcut or by handler
	 * @param {string} shortcut
	 * @param {function} handler
	 */
	p.remove = function (shortcut, handler) {
		store.remove(this.context, normalizer.normalize(shortcut), handler);
	};

	/**
	 *
	 * @param {Event} event
	 * @returns {boolean} isHandled
	 */
	p.handleByKeyEvent = function (event) {
		var normalized = normalizer.fromEvent(event),
			handlers,
			i;

		if (normalized) {
			handlers = store.get(normalized);

			if (handlers) {
				for (i = handlers.length - 1; i >= 0; i--) {
					if (handlers[i]()) {
						return true;
					}
				}
			}
		}

		return false;
	};

	p.destroy = function () {
		this.remove();
	};

	return Manager;

}(SC));