<javascriptresource>
	<name>Bake All Adjustment Layers</name>
	<about>
			This will bake All Adjustment Layers inspect
      in the Active Document.
			Evan Viera
	</about>
	<menu>filter</menu>
	<category>Viera</category>
	<type>automate</type>
	<enableinfo>true</enableinfo>
	</javascriptresource>

#include "vieraLibrary.jsx"

var doc = app.activeDocument;
var activeLayer = doc.activeLayer;

activeLayer.name = getIndex( activeLayer );
