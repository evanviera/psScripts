<javascriptresource>
	<name>Bake Selected Layer</name>
	<about>
			This will bake the selected layer onto all the layers below.
			This is best used for adjustment layers, but it can be a
			layer of any type.
			Evan Viera
	</about>
	<menu>filter</menu>
	<category>Viera</category>
	<type>automate</type>
	<enableinfo>true</enableinfo>
	</javascriptresource>

var doc = activeDocument;
var selectedLayer = doc.activeLayer;
var layerParent = selectedLayer.parent;
var collectedLayers = [ ];
var layerIndex = 0;


layerIndex = getIndex( );

if ( selectedLayer.grouped == true ) collectClippingLayers( );
else collectLayersBelow( layerIndex, layerParent );

proofCopy( );
copyAndMergeSelectedLayer( );
selectedLayer.remove( );

doc.activeLayer = doc.layers[ 0 ];
proofPaste( );		v



/*
		-------------------------------------------------------------

						Returns the index of the selected layer

		-------------------------------------------------------------
*/
function getIndex( )
{
	var index = 0;
	while ( layerParent.layers[ index ] != selectedLayer )
	{
		index++;
	}

	return index;
}



/*
		-------------------------------------------------------------

						Collects all layers below into array

		-------------------------------------------------------------
*/
function collectLayersBelow( __index, __parent )
{
	for ( var i = __index; i < __parent.layers.length; i++ ) {

		var currentLayer = __parent.layers[ i ];
		var isvalid = validateLayer( currentLayer );

		if ( currentLayer.typename == "LayerSet" ) {
			collectLayersBelow( 0, currentLayer );
		} else if ( isvalid == true ) {
			collectedLayers.push( currentLayer );
			currentLayer.allLocked = false;
		}
	}
}



/*
		-------------------------------------------------------------

						Collects all clipping layers of a group

		-------------------------------------------------------------
*/
function collectClippingLayers( )
{
	var i = layerIndex;
	var currentLayer = layerParent.layers[ i ];

	while ( currentLayer.grouped == true )
	{
		currentLayer = layerParent.layers[ i ];
		var isvalid = validateLayer( currentLayer );

		if ( currentLayer.typename == "LayerSet" ) {
			collectLayersBelow( 0, currentLayer );
		} else if ( isvalid == true ) {
			collectedLayers.push( currentLayer );
		}

		i++;
	}
}



/*
		-------------------------------------------------------------

						Executes actions for all layers in array

		-------------------------------------------------------------
*/
function copyAndMergeSelectedLayer( )
{
	for ( var i = 0; i < collectedLayers.length; i++ )
	{
		var duplicatedLayer = selectedLayer.duplicate( collectedLayers[i], ElementPlacement.PLACEBEFORE );
		if ( duplicatedLayer.grouped == false ) duplicatedLayer.grouped = true;
		duplicatedLayer.merge( );
	}
}



/*
		-------------------------------------------------------------

						Proof - Copy and Paste

		-------------------------------------------------------------
*/
function proofCopy( )
{
	doc.selection.selectAll( );
	doc.selection.copy( true );
}

function proofPaste( )
{
	var proof = doc.paste( true );

	proof.name = "PROOF";
	proof.move( doc.layers[ 0 ], ElementPlacement.PLACEBEFORE );
	proof.visible = false;
}



/*
		-------------------------------------------------------------

						Layer is ArtLayer, Visible, and Pixel (Normal)

		-------------------------------------------------------------
*/
function validateLayer( __layer )
{
	if ( __layer.kind == LayerKind.NORMAL ) {
		if ( __layer.typename == "ArtLayer" ) {
			if ( __layer.visible == true) {
				if ( __layer.blendMode == BlendMode.NORMAL ) {
					return true;
				}
			}
		}
	}

	return false;
}
