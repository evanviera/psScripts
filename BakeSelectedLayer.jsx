<javascriptresource>
<name>Bake Adjustments Layer (v1.0)</name>
<menu>filter</menu>
<category>Viera</category>
<type>automate</type>

<about>This will bake the selected adjustment layers to ALL layers below. - by Evan Viera</about>
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
collectedLayers.shift( ); // Remove first layer from array, which is the layer to be copied.

proofCopy( );
copyAndMergeSelectedLayer( );
selectedLayer.remove( );
proofPaste( );

//	****************************************
// 	Returns the index of the selected layer
//	****************************************
function getIndex( )
{
	var index = 0;
	while ( layerParent.layers[ index ] != selectedLayer )
	{
		index++;
	}

	return index;
}



//	****************************************
// 	Collects all layers below into array
//	****************************************
function collectLayersBelow( __index, __parent )
{
    for ( var i = __index; i < __parent.layers.length; i++ ) {

		var currentLayer = __parent.layers[ i ];
        if ( currentLayer.typename == "ArtLayer" ) {
			if ( currentLayer.visible == true ) {
				if ( currentLayer.kind == LayerKind.NORMAL ) {
					collectedLayers.push( currentLayer );
				}
			}
        }

		else {
            collectLayersBelow( 0, currentLayer );
        }
	}
}


//	****************************************
// 	Collects all layers underneat into array
//	****************************************
function collectClippingLayers( )
{
	var i = layerIndex;
	var currentLayer = layerParent.layers[ i ];

	while ( currentLayer.grouped == true )
	{
		currentLayer = layerParent.layers[ i ];

		// If current layer is a folder ("grouped") then collectLayersBelow
		if ( currentLayer.typename == "LayerSet" ) collectLayersBelow( 0, currentLayer );

		if ( currentLayer.typename == "ArtLayer" ) collectedLayers.push( currentLayer );
		i++;
	}
}

//	****************************************
// 	Executes actions for all layers in array
//	****************************************
function copyAndMergeSelectedLayer( )
{
	for ( var i = 0; i < collectedLayers.length; i++ )
	{
		var duplicatedLayer = selectedLayer.duplicate( collectedLayers[i], ElementPlacement.PLACEBEFORE );
		if (duplicatedLayer.grouped == false) duplicatedLayer.grouped = true;
		duplicatedLayer.merge( );
	}
}

//	****************************************
// 	Proof - Copy and Paste
//	****************************************
function proofCopy( )
{
	doc.selection.selectAll( );
	doc.selection.copy(true);
}

function proofPaste( )
{
	var proof = doc.paste(true);

	proof.name = "PROOF";
	proof.move(doc.layers[0], ElementPlacement.PLACEBEFORE);
	proof.visible = false;
}
