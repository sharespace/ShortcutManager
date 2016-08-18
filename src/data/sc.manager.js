/*global SC*/
SC.Manager = (function (SC, p) {
	"use strict";

	var store = new SC.Store(),
		normalizer = new SC.Normalizer(),
		debugMode = false;

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
		//set new context
		this.context = context;
		//and return it
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

		//save data into store
		store.save(normalized, this.context, handler, isDefault);
		debug("register " + shortcut);
	};

	/**
	 * @public
	 * Normalize shortcut to string from KeyboardEvent
	 * @param {string|KeyboardEvent} shortcut
	 * @returns {string}
	 */
	p.normalize = function (shortcut){
		//shortcut is object, try get shortcut from event
		if (typeof shortcut === "object") {
			return normalizer.fromEvent(shortcut);
		}
		//normalize from string
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
	p.event = function (event) {
		var normalized = normalizer.fromEvent(event),
			handlers,
			handled,
			i;

		if (normalized) {
			//get handlers from store
			handlers = store.get(normalized);
			//handlers exists
			if (handlers && handlers.length) {
				//debug mode message
				debug("ShortcutManage: Trying to handle '" + normalized + "' shortcut,", "available handlers:");
				//iterate all handlers
				for (i = handlers.length - 1; i >= 0; i--) {
					//run handler on index
					handled = handlers[i]();
					//handled
					if (handled) {
						//debug mode message and handler
						debug("ShortcutManage: Handler with index '" + i + "' handled shortcut, handler: ");
						debug(handlers[i]);
						//stop handling
						return true;
					}
					//debug mode message for next
					debug("ShortcutManage: Handler with index '" + i + "' returned false...trying next");
				}
				//debug mode message and stop
				debug("ShortcutManage: There is no more handler to try, returning false");
			} else {
				//debug mode message for no handlers
				debug("ShortcutManage: There is no handler for '" + normalized + "' shortcut");
			}
		}
		return false;
	};

	/**
	 * @public
	 * @param {string|KeyboardEvent} shortcut
	 * @returns {boolean} isExists
	 */
	p.exists = function (shortcut) {
		//shortcut is object, try get shortcut from event
		if (typeof shortcut === "object") {
			shortcut = normalizer.fromEvent(shortcut);
		}
		//check if exists
		return store.exists(shortcut);
	};

	/**
	 * @public
	 * Destroy
	 */
	p.destroy = function () {
		this.remove();
	};

	/**
	 * @public
	 * Set debug mode on / off
	 * @param {boolean} state
	 */
	p.debugMode = function (state) {
		debugMode = state;
		console.info("ShortcutManager debug mode is set to " + (state ? "on" : "off"));
	};

	/**
	 * simple debugger, print output if debug is enabled
	 * @param {*} message
	 */
	function debug(message) {
		if (debugMode) {
			console.debug(message);
		}
	}

	return Manager;

}(SC));