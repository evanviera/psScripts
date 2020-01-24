<javascriptresource>
	<name>Boarding - Down one layer</name>
	<about>

	</about>
	<category>Viera</category>
	<enableinfo>true</enableinfo>
	</javascriptresource>

#include "../vieraLibrary.jsx"

var doc = activeDocument;

var index = getIndex( doc.activeLayer );

if ( index != doc.layers.length - 1 )
{
	doc.activeLayer.visible = false;
	++index;
	doc.activeLayer = doc.layers[ index ];
	doc.activeLayer.visible = true;
}
