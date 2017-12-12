/*global SC*/
SC.Manager = (function (SC, p) {
	"use strict";

	var normalizer = new SC.Normalizer(),
		debugMode = false,
		/** @type {Object.<string, SC.Store>}*/
		layersMap = {},
		/** @type {Array.<SC.Store>}*/
		layers = [],
		store;

	/**
	 * @type {Window}
	 * @public
	 */
	SC.scdefault = window;

	/**
	 * @type {Window}
	 * @public
	 */
	SC.sclayer = window;

	//create main store
	store = createLayer(SC.sclayer);

	/**
	 * Manager
	 * @param {boolean} isStatic
	 * @constructor
	 */
	function Manager(isStatic) {
		/** @type {Object}*/
		this.context = SC.scdefault;
		/** @type {SC.Store}*/
		this.layer = store;
		/** @type {boolean}*/
		this.isStatic = isStatic || false;
	}

	p = Manager.prototype;

	/**
	 * @public
	 * Create new ShortcutManager
	 * @param {Object} context
	 * @param {Window|Document|Element|string=} layer
	 * @returns {Manager}
	 */
	p.create = function (context, layer) {
		return new SC.Manager().in(context, layer);
	};

	/**
	 * @public
	 * Set context
	 * @param {Object} context
	 * @param {Window|Document|Element|string=} layer
	 * @returns {Manager}
	 */
	p.in = function (context, layer) {
		//noinspection JSUnresolvedVariable
		if (this.isStatic) {
			throw "ShortcutManager: Can not change context on static method. Use ShortcutManager.create() with right context.";
		}
		//set new context
		this.context = context;
		//set layer
		this.layer = createLayer(layer || SC.sclayer);
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
		this.layer.save(normalized, this.context, handler, isDefault);
		debug("ShortcutManager: Register " + shortcut);
	};

	/**
	 * @public
	 * Activate current layer
	 **/
	p.activate = function () {
		var index;

		//is main store layer
		if (store === this.layer) {
			//clear layers
			layers = [];
			//debug info
			debug("ShortcutManager: Activating main layer store.");
			return;
		}
		//get index in array
		index = layers.indexOf(this.layer);
		//not exists, add as a new layer
		if (index === -1) {
			layers.push(this.layer);

		//remove and make it last
		} else {
			layers.splice(index + 1);
		}
	};

	/**
	 * @public
	 * Deactivate current layer
	 */
	p.deactivate = function () {
		var index;

		//is main store layer, error
		if (store === this.layer) {
			throw "ShortcutManager: Can not deactivate main layer. This is invalid call of deactivate method.";
		}
		//get index in array
		index = layers.indexOf(this.layer);
		//not exists, error
		if (index === -1) {
			throw "ShortcutManager: Can not deactivate layer because is not an active layer.";
		}
		//remove from active
		layers.splice(index);
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
		var normalized = normalizer.normalize(shortcut);

		this.layer.remove(this.context, normalized, handler);
		debug("ShortcutManager: Remove " + shortcut);
	};

	/**
	 * @public
	 * Handle by key event
	 * @param {Event} event
	 * @returns {boolean} isHandled
	 */
	p.event = function (event) {
		var normalized = normalizer.fromEvent(event),
			handlerItem,
			handlers,
			handled,
			i;

		if (normalized) {
			//get handlers from store
			handlers = getLayer().get(normalized);
			//handlers exists
			if (handlers && handlers.length) {
				//debug mode message
				debug("ShortcutManager: Trying to handle '" + normalized + "' shortcut,", "available handlers:");
				//iterate all handlers
				for (i = handlers.length - 1; i >= 0; i--) {
					//handler item
					handlerItem = handlers[i];
					//run handler on index
					handled = handlerItem.handler(normalized, handlerItem.modifier, handlerItem.from);
					//handled
					if (handled) {
						//debug mode message and handler
						debug("ShortcutManager: Handler with index '" + i + "' handled shortcut, handler: ");
						debug(handlerItem.handler);
						//stop handling
						return true;
					}
					//debug mode message for next
					debug("ShortcutManager: Handler with index '" + i + "' returned false...trying next");
				}
				//debug mode message and stop
				debug("ShortcutManager: There is no more handler to try, returning false");
			} else {
				//debug mode message for no handlers
				debug("ShortcutManager: There is no handler for '" + normalized + "' shortcut");
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
		var result;

		//shortcut is object, try get shortcut from event
		if (typeof shortcut === "object") {
			shortcut = normalizer.fromEvent(shortcut);
		}
		//shortcut is string, normalize it
		if (typeof shortcut === "string") {
			shortcut = normalizer.normalize(shortcut);
		}
		//check if exists
		result = getLayer().exists(shortcut);

		//debug mode message for shortcut exists
		if (result) {
			debug("ShortcutManager: Shortcut '" + shortcut + "' is registered");
		} else {
			debug("ShortcutManager: Shortcut '" + shortcut + "' is not registered");
		}

		return result;
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

	/**
	 * Create layer
	 * @param {Element|Document|Window|string} obj
	 * @return {SC.Store}
	 */
	function createLayer(obj) {
		var name = obj;

		//window layer
		if (obj === window || obj === document) {
			name = "[window]";
		}
		//window layer
		if (obj === document.body) {
			name = "[body]";
		}
		//object
		if (typeof obj !== "string") {
			name = path(obj);
		}
		//create layer if not exists
		layersMap[name] = layersMap[name] || new SC.Store();
		//return layer name
		return layersMap[name];
	}

	/**
	 * Get layer
	 * @return {SC.Store}
	 */
	function getLayer() {
		//get default layer
		if (layers.length === 0) {
			//get default layer from map
			return createLayer(SC.sclayer);
		}
		//load last ins stack
		return layers[layers.length - 1];
	}

	/**
	 * Get path
	 * @param {Element} el
	 * @return {string|*}
	 */
	function path(el){
		var id,
			classNames,
			nodeName = el.nodeName,
			parent = el.parentNode;

		//iterate all
		while (parent){
			//class name
			classNames = parent.className ? "." + parent.className : "";
			//id
			id = parent.id ? "#" + parent.id : "";
			//path
			nodeName = parent.nodeName + id + classNames + "/" + nodeName;
			parent = parent.parentNode;
		}
		//return path
		return nodeName || el;
	}

	return Manager;

}(SC));