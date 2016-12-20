/*global SC*/
SC.Normalizer = (function (SC, p) {
	"use strict";

	var plus = "+",
		//ordes of key (ctrl => alt => shift)
		orderMap = {
			ctrl: 0,
			alt: 1,
			shift: 2
		},
		//alias map for special keys
		aliasMap = {
			enter: "return"
		},
		//name keys
		specialKeys = {
			8: "backspace",
			9: "tab",
			13: "return",
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
			106: "*",
			111: "/",
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
			188: ",",
			189: "-",
			190: ".",
			191: "/"
		},
		ignoreShift = {
			187: "+" // "+" is made with shift by nature (shift+"=")
		};

	/**
	 * Returns new order for given part.
	 * @param {string} part
	 * @returns {number} order
	 */
	function getOrder(part) {
		return orderMap[part];
	}

	/**
	 * if code is numpad number, then covert it to simple number char code
	 * @param {number} code
	 * @returns {number}
	 */
	function fixNumpadNumbers(code) {
		return code >= 96 && code <= 105 ? code - 48 : code;
	}

	/**
	 * Returns string from given code.
	 * @param {number} code
	 * @returns {string}
	 */
	function getStringFromCode(code) {
		var value = specialKeys[code];

		code = fixNumpadNumbers(code);
		return value ? value : String.fromCharCode(code).toLowerCase();
	}

	/**
	 * Some shortcuts are made with shift by nature
	 * @param {number} code
	 * @return {boolean}
	 */
	function shiftIgnoredForKey(code) {
		return Boolean(ignoreShift[code]);
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

		//determine shortcut
		shortcut = event.ctrlKey ? "ctrl+" : "";
		shortcut += event.altKey ? "alt+" : "";
		shortcut += event.shiftKey && shiftMakeSense ? "shift+" : "";
		//get string from key code
		shortcut += getStringFromCode(event.keyCode);

		return shortcut;
	};

	/**
	 * Returns normalized shortcut with right ctrl/alt/shift order.
	 * @param {string} shortcut
	 * @returns {string}
	 */
	p.normalize = function (shortcut) {
		var i,
			part,
			parts,
			order,
			result = [],
			others = [];

		//no shortcut defined
		if (shortcut === undefined || shortcut === null) {
			return shortcut;
		}
		// no splitting of exactly "+"
		if (shortcut === plus) {
			return plus;
		}
		//split by +
		parts = shortcut.toLowerCase().split(plus);
		// build new array with ctrl/alt/shift sorted
		for (i = 0; i < parts.length; i++) {
			order = getOrder(parts[i]);
			//not defined, add ti array
			if (order !== undefined) {
				result[order] = parts[i];
			} else {
				//normalize names
				part = normalizeNames(parts[i]);
				//push
				others.push(part);
			}
		}
		//add other parts of shortcut
		result = result.concat(others);
		//remove empty
		result = result.filter(function (val) {
			return val;
		});
		//rejoin
		return result.join(plus);
	};

	/**
	 * Normalize name
	 * @param {string} name
	 * @returns {string}
	 */
	function normalizeNames(name) {
		return aliasMap[name] || name;
	}

	return Normalizer;

}(SC));