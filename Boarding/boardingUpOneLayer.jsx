<javascriptresource>
	<name>Boarding - Up one layer</name>
	<about>

	</about>
	<category>Viera</category>
	<enableinfo>true</enableinfo>
	</javascriptresource>

#include "../vieraLibrary.jsx"

var doc = activeDocument;

var index = getIndex( doc.activeLayer );

if ( index != 0 )
{
	doc.activeLayer.visible = false;
	--index;
	doc.activeLayer = doc.layers[ index ];
	doc.activeLayer.visible = true;
}
