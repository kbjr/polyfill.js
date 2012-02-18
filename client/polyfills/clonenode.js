/**
 * node.cloneNode Polyfill
 */

(function() {
	var Node = window.Node || window.Element;
	
	if (! Node) {
		return false;
	}
	
// ------------------------------------------------------------------
//  Node Types
	
	var ELEMENT_NODE                 = 1;
	var ATTRIBUTE_NODE               = 2;
	var TEXT_NODE                    = 3;
	var CDATA_SECTION_NODE           = 4;
	var ENTITY_REFERENCE_NODE        = 5;
	var ENTITY_NODE                  = 6;
	var PROCESSING_INSTRUCTION_NODE  = 7;
	var COMMENT_NODE                 = 8;
	var DOCUMENT_NODE                = 9;
	var DOCUMENT_TYPE_NODE           = 10;
	var DOCUMENT_FRAGMENT_NODE       = 11;
	var NOTATION_NODE                = 12;
	
// ------------------------------------------------------------------
//  Build the polyfill
	
	Node.prototype.cloneNode = cloneNode;
	
	function cloneNode(node, deep) {
		var ret;
		var doc = node.ownerDocument || document;
		switch (node.nodeType) {
			case ELEMENT_NODE:
				ret = createElement(node);
				for (var i = 0, c = node.attributes.length; i < c; i++) {
					var attr = node.attributes[i];
					ret.setAttribute(attr.name, attr.value);
				}
			break;
			case DOCUMENT_NODE:
				ret = document.implementation.createDocument('', '', null);
			break;
			case DOCUMENT_FRAGMENT_NODE:
				ret = document.createDocumentFragment();
			break;
			case DOCUMENT_TYPE_NODE:
				ret = document.implementation.createDocumentType(node.name, node.publicId, node.systemId);
			break;
			case COMMENT_NODE:
				ret = document.createComment(node.data);
			break;
			case TEXT_NODE:
				ret = document.createTextNode(node.data);
			break;
			case PROCESSING_INSTRUCTION_NODE:
				ret = document.createProcessingInstruction(node.target, node.data);
			break;
		}
		if (deep) {
			var children = node.childNodes;
			for (var i = 0, c = children.length; i < c; i++) {
				ret.appendChild(children[i].cloneNode(deep));
			}
		}
		return ret;
	}
	
	// document.createElement/document.createElementNS wrapper
	var createElement = (function() {
		if (document.createElementNS) {
			return function(node) {
				var ns = node.nodeName;
				if (node.prefix) {
					ns = node.prefix + ns;
				}
				return document.createElementNS(node.namespaceURI, ns);
			};
		} else {
			return function(node) {
				return document.createElement(node.nodeName);
			};
		}
	}());
	
}());

/* End of file clonenode.js */
