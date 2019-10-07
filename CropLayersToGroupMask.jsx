<javascriptresource>
	<name>Crop Layers to Group's Mask</name>
	<about>
			This will take the group's mask and crop all
      layers within the group to the mask.
	</about>
	<menu>filter</menu>
	<category>Viera</category>
	<type>automate</type>
	<enableinfo>true</enableinfo>
	</javascriptresource>

#include "vieraLibrary.jsx"

var doc = activeDocument;
var selectedLayer = doc.activeLayer;
var layerParent = selectedLayer.parent;

if ( selectedLayer.typename == "LayerSet" ) {
  if ( hasLayerMask( selectedLayer ) ) {
    alert( "Yes this is valid!" );
  }
  else {
    alert( "Selected Layer has no layer mask" )
  }
}
else {
  alert( "Selected Layer is not a Layer Set" );
}
