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

var collectedLayers = [ ];



if ( selectedLayer.typename == "LayerSet" )
{
  if ( hasLayerMask( selectedLayer ) )
	{
		collectedLayers = collectLayersBelow( 0, selectedLayer );
		layerMaskToSelection( );
		doc.selection.invert( );
  }
  else
	{
    alert( "Selected Layer has no layer mask" )
  }
}
else
{
  alert( "Selected Layer is not a Layer Set" );
}



for ( var i = 0; i < collectedLayers.length; i++ )
{
	doc.activeLayer =	collectedLayers[ i ];
	doc.selection.clear( );
}

var bounds = [ 0, 0, doc.width, doc.height ];

doc.crop( bounds );
