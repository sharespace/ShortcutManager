/*global SC*/
SC.Store = (function (SC, p) {
	"use strict";

	//multikeys regex
	var splitter = "..",
		regex = /.*\+(\[([0-9]..[0-9])\])/g;

	/**
	 * Shortcut record create
	 * @param {Object} store
	 * @param {string} shortcut
	 * @returns {Array.<HandlerRecord>}
	 */
	function getRecord(store, shortcut) {
		var data = store[shortcut];

		//record not exists, create it
		if (!data) {
			data = [];
			store[shortcut] = data;
		}
		//return
		return data;
	}

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
	 * @returns {Array.<HandlerRecord>}
	 */
	function getHandlers(store, shortcut) {
		return store[shortcut] || null;
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

		//default manager, set record as empty
		if (context === SC.scdefault) {
			record.length = 0;
			return;

		}
		//iterate all
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

	/**
	 * @param {object} store
	 * @param {string} shortcut
	 */
	function deleteIfEmpty(store, shortcut) {
		var record = store[shortcut];

		if (record && record.length === 0) {
			delete store[shortcut];
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
			isDefault = context === SC.scdefault;

		for (key in store) {
			if (store.hasOwnProperty(key)) {
				//get record
				handlerRecords = store[key];
				//iterate all record from end
				for (i = handlerRecords.length - 1; i >= 0; i--) {
					//check context or if default manager
					if (handlerRecords[i].context === context || isDefault) {
						handlerRecords.splice(i, 1);
					}
				}
				//delete from store if empty
				if (handlerRecords.length === 0) {
					delete store[key];
				}
			}
		}
	}

	/**
	 * Save shortcut
	 * @param {*} store
	 * @param {Array.<string>} shortcut
	 * @param {Object} context
	 * @param {function} handler
	 * @param {boolean} isDefault
	 */
	function saveShortcut(store, shortcut, context, handler, isDefault) {
		//noinspection JSUnresolvedVariable
		var handlers = getRecord(store, shortcut[0]),
			hasDefaultHandler = hasDefault(handlers),
			handlerRecord = new HandlerRecord(context, handler, /** @type {number}*/shortcut[1], isDefault);

		if (isDefault) {
			//has nor default handler
			if (!hasDefaultHandler) {
				//add to the start of handlers
				handlers.unshift(handlerRecord);
				return;
			}
			//error for default handler
			throw "ShortcutManager: Can not add another default handler for shortcut " + shortcut + ".";

		}
		//push next handler
		handlers.push(handlerRecord);
	}

	/**
	 * Remove shortcut
	 * @param {*} store
	 * @param {Array.<string>} shortcut
	 * @param {Object} context
	 * @param {function} handler
	 */
	function removeShortcut(store, shortcut, context, handler) {
		//delete by shortcut
		if (shortcut[0] !== undefined && shortcut[0] !== null) {
			removeByShortcut(store, context, shortcut[0], handler);

		//delete by context
		} else {
			removeByContext(store, context);
		}
		deleteIfEmpty(store, shortcut[0]);
	}

	/**
	 * Resolve shortcuts
	 * @param {string} shortcut
	 * @return {Array.<Array.<string, number>>}
	 */
	function resolveShortcuts(shortcut) {
		var i,
			to,
			data,
			from,
			range,
			group,
			shortcuts = [];

		//variable shortcut
		if (shortcut && shortcut.match(regex)) {
			//get range from shortcut
			data = regex.exec(shortcut);
			group = data[1];
			range = data[2].split(splitter);
			//range
			from = parseInt(range[0], 10);
			to = parseInt(range[1], 10);
			//iterate range
			for (i = from; i <= to; i++) {
				shortcuts.push([shortcut.replace(group, i), i]);
			}
			//error
			if (shortcuts.length === 0) {
				throw "Regex shortcut do not match any handler.";
			}
			//return
			return shortcuts;
		}
		//add shortcut
		shortcuts.push([shortcut || null, -1]);
		//normal shortcut
		return shortcuts;
	}

	/**
	 * Handlers holder.
	 * @param {Object} context
	 * @param {function} handler
	 * @param {number} modifier
	 * @param {boolean} isDefault
	 * @constructor
	 */
	function HandlerRecord(context, handler, modifier, isDefault) {
		/** @type {boolean} */
		this.isDefault = isDefault || false;
		/** @type {number}*/
		this.modifier = modifier;
		/** @type {Object} */
		this.context = context;
		/** @type {function} */
		this.handler = handler;
	}

	/**
	 * Creates new store.
	 * @constructor
	 */
	function Store() {
		/** @type {Object.<string, Array.<HandlerRecord>>} */
		this.store = {};
	}

	//shortcut
	p = Store.prototype;

	/**
	 * @public
	 * Save.
	 * @param {string} shortcut
	 * @param {Object} context
	 * @param {function} handler
	 * @param {boolean} isDefault
	 */
	p.save = function (shortcut, context, handler, isDefault) {
		var i,
			shortcuts = resolveShortcuts(shortcut);

		for (i = 0; i < shortcuts.length; i++) {
			saveShortcut(this.store, shortcuts[i], context, handler, isDefault);
		}
	};

	/**
	 * @public
	 * Get handler for given shortcut
	 * @param {string} shortcut
	 * @returns {Array.<HandlerRecord>}
	 */
	p.get = function (shortcut) {
		//noinspection JSUnresolvedVariable
		return getHandlers(this.store, shortcut);
	};

	/**
	 * @public
	 * @param {string} shortcut
	 * @returns {boolean} isExists
	 */
	p.exists = function (shortcut) {
		//noinspection JSUnresolvedVariable
		return Boolean(this.store[shortcut]);
	};

	/**
	 * @public
	 * Removes all handlers assigned to given context or removes only short
	 * @param {Object} context
	 * @param {string} shortcut
	 * @param {function} handler
	 */
	p.remove = function (context, shortcut, handler) {
		var i,
			shortcuts = resolveShortcuts(shortcut);

		for (i = 0; i < shortcuts.length; i++) {
			removeShortcut(this.store, shortcuts[i], context, handler);
		}
	};

	return Store;

}(SC));