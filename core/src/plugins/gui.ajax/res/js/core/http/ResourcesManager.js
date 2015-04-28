'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright 2007-2013 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
 * This file is part of Pydio.
 *
 * Pydio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <http://pyd.io/>.
 */

/**
 * A manager that can handle the loading of JS, CSS and checks dependencies
 */

var ResourcesManager = (function () {
	/**
  * Constructor
  */

	function ResourcesManager() {
		_classCallCheck(this, ResourcesManager);

		this.mainFormContainerId = 'all_forms';
		this.resources = {};
		this.loaded = false;
	}

	_createClass(ResourcesManager, [{
		key: 'addJSResource',

		/**
   * Adds a Javascript resource
   * @param fileName String
   * @param className String
   */
		value: function addJSResource(fileName, className) {
			if (!this.resources.js) {
				this.resources.js = [];
			}
			this.resources.js.push({ fileName: fileName, className: className });
		}
	}, {
		key: 'addCSSResource',

		/**
   * Adds a CSS resource
   * @param fileName String
   */
		value: function addCSSResource(fileName) {
			if (!this.resources.css) {
				this.resources.css = [];
			}
			this.resources.css.push(fileName);
		}
	}, {
		key: 'addGuiForm',

		/**
   * Adds a FORM from html snipper
   * @param formId String
   * @param htmlSnippet String
   */
		value: function addGuiForm(formId, htmlSnippet) {
			if (!this.resources.forms) {
				this.resources.forms = new Map();
			}
			this.resources.forms.set(formId, htmlSnippet);
		}
	}, {
		key: 'addDependency',

		/**
   * Add a dependency to another plugin
   * @param data Object
   */
		value: function addDependency(data) {
			if (!this.resources.dependencies) {
				this.resources.dependencies = [];
			}
			this.resources.dependencies.push(data);
		}
	}, {
		key: 'hasDependencies',

		/**
   * Check if some dependencies must be loaded before
   * @returns Boolean
   */
		value: function hasDependencies() {
			return this.resources.dependencies || false;
		}
	}, {
		key: 'load',

		/**
   * Load resources
   * @param resourcesRegistry $H Ajaxplorer ressources registry
   */
		value: function load(resourcesRegistry) {
			if (this.loaded) {
				return;
			}if (this.hasDependencies()) {
				this.resources.dependencies.forEach((function (el) {
					if (resourcesRegistry[el]) {
						resourcesRegistry[el].load(resourcesRegistry);
					}
				}).bind(this));
			}
			if (this.resources.forms) {
				this.resources.forms.forEach((function (value, key) {
					this.loadGuiForm(key, value);
				}).bind(this));
			}
			if (this.resources.js) {
				this.resources.js.forEach((function (value) {
					this.loadJSResource(value.fileName, value.className);
				}).bind(this));
			}
			if (this.resources.css) {
				this.resources.css.forEach((function (value) {
					this.loadCSSResource(value);
				}).bind(this));
			}
			this.loaded = true;
		}
	}, {
		key: 'loadJSResource',

		/**
   * Load a javascript file
   * @param fileName String
   * @param className String
      * @param callback Function
      * @param aSync Boolean
   */
		value: function loadJSResource(fileName, className, callback, aSync) {

			if (!window[className]) {
				if (typeof className != 'function' || typeof className.prototype != 'object') {
					PydioApi.loadLibrary(fileName, callback, aSync);
				}
			} else if (callback) {
				callback();
			}
		}
	}, {
		key: 'loadCSSResource',

		/**
   * Load a CSS file
   * @param fileName String
   */
		value: function loadCSSResource(fileName) {

			var head = document.getElementsByTagName('head')[0];
			if (head && head.down) {
				if (pydio.Parameters.get('SERVER_PREFIX_URI')) {
					fileName = pydio.Parameters.get('SERVER_PREFIX_URI') + fileName;
				}
				fileName = fileName + '?v=' + pydio.Parameters.get('ajxpVersion');
				// WARNING PROTOTYPE STUFF
				var select = head.down('[href="' + fileName + '"]');
				if (!select) {
					var cssNode = new Element('link', {
						type: 'text/css',
						rel: 'stylesheet',
						href: fileName,
						media: 'screen'
					});
					head.insert(cssNode);
				}
			}
		}
	}, {
		key: 'loadGuiForm',

		/**
   * Insert the HTML snipper and evaluate scripts
   * @param formId String
   * @param htmlSnippet String
   */
		value: function loadGuiForm(formId, htmlSnippet) {
			if (!$(this.mainFormContainerId).select('[id="' + formId + '"]').length) {
				// TODO - PROTOTYPE STUFF
				htmlSnippet.evalScripts();
				$(this.mainFormContainerId).insert(htmlSnippet.stripScripts());
			}
		}
	}, {
		key: 'loadFromXmlNode',

		/**
   * Load the resources from XML
   * @param node XMLNode
   */
		value: function loadFromXmlNode(node) {
			var clForm = {};
			var k;
			if (node.nodeName == 'resources') {
				for (k = 0; k < node.childNodes.length; k++) {
					if (node.childNodes[k].nodeName == 'js') {
						this.addJSResource(node.childNodes[k].getAttribute('file'), node.childNodes[k].getAttribute('className'));
					} else if (node.childNodes[k].nodeName == 'css') {
						this.addCSSResource(node.childNodes[k].getAttribute('file'));
					} else if (node.childNodes[k].nodeName == 'img_library') {
						ResourcesManager.addImageLibrary(node.childNodes[k].getAttribute('alias'), node.childNodes[k].getAttribute('path'));
					}
				}
			} else if (node.nodeName == 'dependencies') {
				for (k = 0; k < node.childNodes.length; k++) {
					if (node.childNodes[k].nodeName == 'pluginResources') {
						this.addDependency(node.childNodes[k].getAttribute('pluginName'));
					}
				}
			} else if (node.nodeName == 'clientForm') {
				if (!node.getAttribute('theme') || node.getAttribute('theme') == pydio.Parameters.get('theme')) {
					clForm = { formId: node.getAttribute('id'), formCode: node.firstChild.nodeValue };
				}
			}
			if (clForm.formId) {
				this.addGuiForm(clForm.formId, clForm.formCode);
			}
		}
	}], [{
		key: 'addImageLibrary',

		/**
   *
   * @param aliasName
   * @param aliasPath
   * @todo MOVE OUTSIDE?
   */
		value: function addImageLibrary(aliasName, aliasPath) {
			if (!window.AjxpImageLibraries) window.AjxpImageLibraries = {};
			window.AjxpImageLibraries[aliasName] = aliasPath;
		}
	}, {
		key: 'loadAutoLoadResources',

		/**
   * Check if resources are tagged autoload and load them
   * @param registry DOMDocument XML Registry
   */
		value: function loadAutoLoadResources(registry) {
			var manager = new ResourcesManager();
			var jsNodes = XMLUtils.XPathSelectNodes(registry, 'plugins/*/client_settings/resources/js[@autoload="true"]');
			var node;
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = jsNodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					node = _step.value;

					manager.loadJSResource(node.getAttribute('file'), node.getAttribute('className'));
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator['return']) {
						_iterator['return']();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}

			var imgNodes = XMLUtils.XPathSelectNodes(registry, 'plugins/*/client_settings/resources/img_library');
			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				for (var _iterator2 = imgNodes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					node = _step2.value;

					ResourcesManager.addImageLibrary(node.getAttribute('alias'), node.getAttribute('path'));
				}
			} catch (err) {
				_didIteratorError2 = true;
				_iteratorError2 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion2 && _iterator2['return']) {
						_iterator2['return']();
					}
				} finally {
					if (_didIteratorError2) {
						throw _iteratorError2;
					}
				}
			}

			var cssNodes = XMLUtils.XPathSelectNodes(registry, 'plugins/*/client_settings/resources/css[@autoload="true"]');
			var _iteratorNormalCompletion3 = true;
			var _didIteratorError3 = false;
			var _iteratorError3 = undefined;

			try {
				for (var _iterator3 = cssNodes[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
					node = _step3.value;

					manager.loadCSSResource(node.getAttribute('file'));
				}
			} catch (err) {
				_didIteratorError3 = true;
				_iteratorError3 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion3 && _iterator3['return']) {
						_iterator3['return']();
					}
				} finally {
					if (_didIteratorError3) {
						throw _iteratorError3;
					}
				}
			}
		}
	}]);

	return ResourcesManager;
})();