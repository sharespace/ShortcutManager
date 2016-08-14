/*global SC*/
SC.Manager = (function (SC, p) {
	"use strict";

	var store = new SC.Store(),
		normalizer = new SC.Normalizer();

	/**
	 * @type {Window}
	 * @public
	 */
	SC.scdefault = window;

	/**
	 * Manager
	 * @param {boolean} isStatic
	 * @constructor
	 */
	function Manager(isStatic) {
		/** @type {Object}*/
		this.context = SC.scdefault;
		/** @type {boolean}*/
		this.isStatic = isStatic || false;
	}

	p = Manager.prototype;

	/**
	 * @public
	 * Create new ShortcutManager
	 * @param {Object} context
	 * @returns {Manager}
	 */
	p.create = function (context) {
		return new SC.Manager().in(context);
	};

	/**
	 * @public
	 * Set context
	 * @param {Object} context
	 * @returns {Manager}
	 */
	p.in = function (context) {
		//noinspection JSUnresolvedVariable
		if (this.isStatic) {
			throw "ShortcutManager: Can not change context on static method. Use ShortcutManager.create() with right context.";
		}

		this.context = context;

		return this;
	};

	/**
	 * @public
	 * Register new shortcut
	 * @param {string} shortcut
	 * @param {function} handler
	 * @param {boolean=} isDefault indicates default handler (can be overridden)
	 */
	p.on = function (shortcut, handler, isDefault) {
		var normalized = normalizer.normalize(shortcut);

		store.save(normalized, this.context, handler, isDefault);
	};

	/**
	 * @public
	 * Normalize shortcut to string from KeyboardEvent
	 * @param {KeyboardEvent} event
	 * @returns {string}
	 */
	p.normalizeFromEvent = function (event){
		return normalizer.fromEvent(event);
	};

	/**
	 * @public
	 * Normalize shortcut to string from KeyboardEvent
	 * @param {string} shortcut
	 * @returns {string}
	 */
	p.normalize = function (shortcut){
		return normalizer.normalize(shortcut);
	};

	/**
	 * @public
	 * Removes handlers by context, shortcut or by handler
	 * @param {string=} shortcut
	 * @param {function=} handler
	 */
	p.remove = function (shortcut, handler) {
		store.remove(this.context, normalizer.normalize(shortcut), handler);
	};

	/**
	 * @public
	 * Handle by key event
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

	/**
	 * @public
	 * Destroy
	 */
	p.destroy = function () {
		this.remove();
	};

	return Manager;

}(SC));