var SC = {};;/*global SC*/
SC.Store = (function (SC, p) {
	"use strict";

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
	 * @returns {Array.<function>}
	 */
	function getHandlers(store, shortcut) {
		var handlers = store[shortcut];

		if (handlers) {
			return handlers.map(function (item) {
				return item.handler;
			});
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

		if (context === SC.scdefault) {
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
			isDefault = context === SC.scdefault;

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
	 * Handlers holder.
	 * @param {Object} context
	 * @param {function} handler
	 * @param {boolean} isDefault
	 * @constructor
	 */
	function HandlerRecord(context, handler, isDefault) {
		/** @type {boolean} */
		this.isDefault = isDefault || false;
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
		//noinspection JSUnresolvedVariable
		var store = this.store,
			handlers = getRecord(store, shortcut),
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
	 * @public
	 * Get handler for given shortcut
	 * @param {string} shortcut
	 * @returns {Array.<function>}
	 */
	p.get = function (shortcut) {
		//noinspection JSUnresolvedVariable
		return getHandlers(this.store, shortcut);
	};

	/**
	 * @public
	 * Removes all handlers assigned to given context or removes only short
	 * @param {Object} context
	 * @param {string} shortcut
	 * @param {function} handler
	 */
	p.remove = function (context, shortcut, handler) {
		//noinspection JSUnresolvedVariable
		var store = this.store;

		if (shortcut !== undefined && shortcut !== null) {
			removeByShortcut(store, context, shortcut, handler);
		} else {
			removeByContext(store, context);
		}
	};

	return Store;

}(SC));;/*global SC*/
SC.Normalizer = (function (SC, p) {
	"use strict";

	var orderMap = {
			ctrl: 0,
			alt: 1,
			shift: 2
		},
		specialKeys = {
			8: "backspace",
			9: "tab",
			13: "enter",
			19: "pause",
			20: "capslock",
			27: "esc",
			32: "space",
			33: "pageup",
			34: "pagedown",
			35: "end",
			36: "home",
			37: "left",
			38: "up",
			39: "right",
			40: "down",
			45: "insert",
			46: "delete",
			112: "f1",
			113: "f2",
			114: "f3",
			115: "f4",
			116: "f5",
			117: "f6",
			118: "f7",
			119: "f8",
			120: "f9",
			121: "f10",
			122: "f11",
			123: "f12",
			144: "numlock",
			145: "scrolllock",
			107: "+",
			109: "-",
			187: "+",
			189: "-"
		},
		ignoreShift = [
			187 // "+" is made with shift by nature (shift+"=")
		];

	/**
	 * Returns new order for given part.
	 * @param {string} part
	 * @returns {number} order
	 */
	function getOrder(part) {
		return orderMap[part];
	}

	/**
	 * Returns string from given code.
	 * @param {number} code
	 * @returns {string}
	 */
	function getStringFromCode(code) {
		var value = specialKeys[code];

		return value ? value : String.fromCharCode(code).toLowerCase();
	}

	/**
	 * Some shortcuts are made with shift by nature
	 * @param {number} code
	 * @return {boolean}
	 */
	function shiftIgnoredForKey(code) {
		return ignoreShift.indexOf(code) !== -1;
	}

	/**
	 * Shortcut string builder.
	 * @constructor
	 */
	function Normalizer() {
	}

	p = Normalizer.prototype;

	/**
	 * Return normalized shortcut from event.
	 * @param {Event} event
	 * @returns {string}
	 */
	p.fromEvent = function (event) {
		var shortcut,
			shiftMakeSense = !shiftIgnoredForKey(event.keyCode);


		shortcut = event.ctrlKey ? "ctrl+" : "";
		shortcut += event.altKey ? "alt+" : "";
		shortcut += event.shiftKey && shiftMakeSense ? "shift+" : "";
		shortcut += getStringFromCode(event.keyCode);

		return shortcut;
	};

	/**
	 * Returns normalized shortcut with right ctrl/alt/shift order.
	 * @param {string} shortcut
	 * @returns {string}
	 */
	p.normalize = function (shortcut) {
		var parts,
			i,
			order,
			result = [],
			others = [];

		if (shortcut === undefined || shortcut === null) {
			return shortcut;
		}

		if (shortcut === "+") {
			return "+";
		}

		parts = shortcut.toLowerCase().split("+");

		// build new array with ctrl/alt/shift sorted
		for (i = 0; i < parts.length; i++) {
			order = getOrder(parts[i]);

			if (order !== undefined) {
				result[order] = parts[i];
			} else {
				others.push(parts[i]);
			}
		}

		//add other parts of shortcut
		result = result.concat(others);

		//remove empty
		result = result.filter(function (val) {
			return val;
		});

		return result.join("+");
	};

	return Normalizer;

}(SC));;/*global SC*/
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

}(SC));;/*global SC*/
var ShortcutManager = new SC.Manager(true);