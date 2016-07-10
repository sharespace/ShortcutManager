/*global SC*/
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
			145: "scrolllock"
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
	 * Returns string from given code.
	 * @param {number} code
	 * @returns {string}
	 */
	function getStringFromCode(code) {
		var value = specialKeys[code];

		return value ? value : String.fromCharCode(code).toLowerCase();
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
		var shortcut;

		shortcut = event.ctrlKey ? "ctrl+" : "";
		shortcut += event.altKey ? "alt+" : "";
		shortcut += event.shiftKey ? "shift+" : "";
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

}(SC));