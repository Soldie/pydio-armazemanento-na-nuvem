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
class ResourcesManager{
	/**
	 * Constructor
	 */
	constructor(){
		this.mainFormContainerId = 'all_forms';
		this.resources = {};
		this.loaded = false;
	}	
	/**
	 * Adds a Javascript resource
	 * @param fileName String
	 * @param className String
	 */
	addJSResource(fileName, className){
		if(!this.resources.js){
			this.resources.js = [];
		}
		this.resources.js.push({fileName:fileName,className:className});
	}
	/**
	 * Adds a CSS resource
	 * @param fileName String
	 */
	addCSSResource(fileName){
		if(!this.resources.css){
			this.resources.css = [];
		}
		this.resources.css.push(fileName);
	}
	/**
	 * Adds a FORM from html snipper
	 * @param formId String
	 * @param htmlSnippet String
	 */
	addGuiForm(formId, htmlSnippet){
		if(!this.resources.forms){
			this.resources.forms = new Map();
		}
		this.resources.forms.set(formId,htmlSnippet);
	}
	/**
	 * Add a dependency to another plugin
	 * @param data Object
	 */
	addDependency(data){
		if(!this.resources.dependencies){
			this.resources.dependencies = [];
		}
		this.resources.dependencies.push(data);
	}
	/**
	 * Check if some dependencies must be loaded before
	 * @returns Boolean
	 */
	hasDependencies(){
		return (this.resources.dependencies || false);
	}
	/**
	 * Load resources
	 * @param resourcesRegistry $H Ajaxplorer ressources registry
	 */
	load(resourcesRegistry){
		if(this.loaded) return;
		if(this.hasDependencies()){
			this.resources.dependencies.forEach(function(el){
				if(resourcesRegistry[el]){
					resourcesRegistry[el].load(resourcesRegistry);
				}
			}.bind(this) );
		}		
		if(this.resources.forms){
			this.resources.forms.forEach(function(value,key){
				this.loadGuiForm(key, value);
			}.bind(this) );
		}
		if(this.resources.js){
			this.resources.js.forEach(function(value){
				this.loadJSResource(value.fileName, value.className);
			}.bind(this));
		}
		if(this.resources.css){
			this.resources.css.forEach(function(value){
				this.loadCSSResource(value);
			}.bind(this));
		}
		this.loaded = true;
	}
	/**
	 * Load a javascript file
	 * @param fileName String
	 * @param className String
     * @param callback Function
     * @param aSync Boolean
	 */
	loadJSResource(fileName, className, callback, aSync){

		if(!window[className]){
			if(typeof(className)!='function' || typeof(className.prototype)!='object'){
                PydioApi.loadLibrary(fileName, callback, aSync);
			}
		}else if(callback){
            callback();
        }
	}
	/**
	 * Load a CSS file
	 * @param fileName String
	 */
	loadCSSResource(fileName){

		var head = document.getElementsByTagName('head')[0];
        if(head && head.down){
            if(pydio.Parameters.get('SERVER_PREFIX_URI')){
                fileName = pydio.Parameters.get('SERVER_PREFIX_URI')+fileName;
            }
            fileName = fileName+"?v="+pydio.Parameters.get("ajxpVersion");
            // WARNING PROTOTYPE STUFF
            var select = head.down('[href="'+fileName+'"]');
            if(!select){
                var cssNode = new Element('link', {
                    type : 'text/css',
                    rel  : 'stylesheet',
                    href : fileName,
                    media : 'screen'
                });
                head.insert(cssNode);
            }
        }
	}
	/**
	 * Insert the HTML snipper and evaluate scripts
	 * @param formId String
	 * @param htmlSnippet String
	 */
	loadGuiForm(formId, htmlSnippet){
		if(!$(this.mainFormContainerId).select('[id="'+formId+'"]').length){
            // TODO - PROTOTYPE STUFF
			htmlSnippet.evalScripts();
			$(this.mainFormContainerId).insert(htmlSnippet.stripScripts());
		}
	}
	/**
	 * Load the resources from XML
	 * @param node XMLNode
	 */
	loadFromXmlNode(node){
        var clForm = {};
        var k;
		if(node.nodeName == "resources"){
			for(k=0;k<node.childNodes.length;k++){
				if(node.childNodes[k].nodeName == 'js'){
					this.addJSResource(node.childNodes[k].getAttribute('file'), node.childNodes[k].getAttribute('className'));
				}else if(node.childNodes[k].nodeName == 'css'){
					this.addCSSResource(node.childNodes[k].getAttribute('file'));
				}else if(node.childNodes[k].nodeName == 'img_library'){
					ResourcesManager.addImageLibrary(node.childNodes[k].getAttribute('alias'), node.childNodes[k].getAttribute('path'));
				}
			}		
		}else if(node.nodeName == "dependencies"){
			for(k=0;k<node.childNodes.length;k++){
				if(node.childNodes[k].nodeName == "pluginResources"){
					this.addDependency(node.childNodes[k].getAttribute("pluginName"));
				}
			}
		}else if(node.nodeName == "clientForm"){
            if(!node.getAttribute("theme") || node.getAttribute("theme") == pydio.Parameters.get("theme")){
                clForm = {formId:node.getAttribute("id"), formCode:node.firstChild.nodeValue};
            }
		}
        if(clForm.formId){
            this.addGuiForm(clForm.formId, clForm.formCode);
        }
	}

    /**
     *
     * @param aliasName
     * @param aliasPath
     * @todo MOVE OUTSIDE?
     */
    static addImageLibrary(aliasName, aliasPath){
        if(!window.AjxpImageLibraries) window.AjxpImageLibraries = {};
        window.AjxpImageLibraries[aliasName] = aliasPath;
    }

	/**
	 * Check if resources are tagged autoload and load them
	 * @param registry DOMDocument XML Registry
	 */
	static loadAutoLoadResources(registry){
        var manager = new ResourcesManager();
		var jsNodes = XMLUtils.XPathSelectNodes(registry, 'plugins/*/client_settings/resources/js[@autoload="true"]');
        var node;
        for(node of jsNodes){
            manager.loadJSResource(node.getAttribute('file'), node.getAttribute('className'));
        }
		var imgNodes = XMLUtils.XPathSelectNodes(registry, 'plugins/*/client_settings/resources/img_library');
        for(node of imgNodes){
            ResourcesManager.addImageLibrary(node.getAttribute('alias'), node.getAttribute('path'));
        }
		var cssNodes = XMLUtils.XPathSelectNodes(registry, 'plugins/*/client_settings/resources/css[@autoload="true"]');
        for(node of cssNodes){
			manager.loadCSSResource(node.getAttribute("file"));
        }
	}
}