/*global SC*/
SC.Store = (function (SC, p) {
	"use strict";

	var Store,
		HandlerRecord;

	/**
	 * Shortcut record create
	 * @param {Object} store
	 * @param {string} shortcut
	 * @returns {Array.<HandlerRecord>}
	 */
	function getRecord(store, shortcut) {
		var data = store[shortcut];

		if (!data) {
			data = [];
			store[shortcut] = data;
		}
		return data;
	}

	//noinspection JSValidateJSDoc
	/**
	 * find default handler
	 * @param {Array.<HandlerRecord>} handlers
	 * @returns {boolean} if there is default handler
	 */
	function hasDefault(handlers) {
		var i;

		for (i = 0; i < handlers.length; i++) {
			if (handlers[i].isDefault) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Get handler.
	 * @param {Object} store
	 * @param {string} shortcut
	 * @returns {function}
	 */
	function getHandlers(store, shortcut) {
		var handlers = store[shortcut];

		if (handlers) {
			return handlers.map(function (item) { return item.handler; });
		}

		return null;
	}

	/**
	 * Removes shortcuts by name
	 * @param {object} store
	 * @param {object} context
	 * @param {string} shortcut
	 * @param {function} handler
	 */
	function removeByShortcut(store, context, shortcut, handler) {
		var i,
			handlerRecord,
			record = getRecord(store, shortcut),
			length = record.length;

		if (context === SC._default) {
			record.length = 0;
		} else {
			for (i = length - 1; i >= 0; i--) {
				handlerRecord = record[i];
				//remove by context and handler
				if (handlerRecord.context === context && handlerRecord.handler === handler) {
					record.splice(i, 1);
				}
				//remove by context
				if (!handler && handlerRecord.context === context) {
					record.splice(i, 1);
				}
			}
		}
	}

	/**
	 * Removes all shortcuts by context
	 * @param {object} store
	 * @param {object} context
	 */
	function removeByContext(store, context) {
		var i,
			key,
			handlerRecords,
			isDefault = context === SC._default;

		for (key in store) {
			if (store.hasOwnProperty(key)) {
				handlerRecords = store[key];
				for (i = handlerRecords.length - 1; i >= 0; i--) {
					if (handlerRecords[i].context === context || isDefault) {
						handlerRecords.splice(i, 1);
					}
				}
				if (handlerRecords.length === 0) {
					delete store[key];
				}
			}
		}
	}

	/**
	 * Creates new store.
	 * @constructor
	 */
	Store = function () {
		//noinspection JSValidateJSDoc
		/** @type {Object.<string, Array.<HandlerRecord>>} */
		this.store = {};
	};

	//shortcut
	p = Store.prototype;

	/**
	 * Handlers holder.
	 * @param {Object} context
	 * @param {function} handler
	 * @param {boolean} isDefault
	 * @constructor
	 */
	HandlerRecord = function (context, handler, isDefault) {
		/** @type {boolean} */
		this.isDefault = isDefault || false;
		/** @type {Object} */
		this.context = context;
		/** @type {function} */
		this.handler = handler;
	};

	/**
	 * Save.
	 * @param {string} shortcut
	 * @param {Object} context
	 * @param {function} handler
	 * @param {boolean} isDefault
	 */
	p.save = function (shortcut, context, handler, isDefault) {
		var handlers = getRecord(this.store, shortcut),
			hasDefaultHandler = hasDefault(handlers),
			handlerRecord = new HandlerRecord(context, handler, isDefault);

		if (isDefault) {
			if (!hasDefaultHandler) {
				handlers.unshift(handlerRecord); //add to the start of handlers
			} else {
				throw "ShortcutManager: Can not add another default handler for shortcut " + shortcut + ".";
			}
		} else {
			handlers.push(handlerRecord);
		}
	};

	/**
	 * get handler for given shortcut
	 * @param {string} shortcut
	 * @returns {function}
	 */
	p.get = function (shortcut) {
		return getHandlers(this.store, shortcut);
	};

	/**
	 * Removes all handlers assigned to given context or removes only short
	 * @param {Object} context
	 * @param {string} shortcut
	 * @param {function} handler
	 */
	p.remove = function (context, shortcut, handler) {
		if (shortcut !== undefined && shortcut !== null) {
			removeByShortcut(this.store, context, shortcut, handler);
		} else {
			removeByContext(this.store, context);
		}
	};

	return Store;

}(SC));