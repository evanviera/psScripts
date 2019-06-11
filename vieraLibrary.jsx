//	****************************************
// 	Returns the index of the selected layer
//	****************************************
function getIndex( __selectedLayer )
{
	var index = 0;
	while ( __selectedLayer.parent.layers[ index ] != __selectedLayer )
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
    var collectedLayers = [];
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

  return collectedLayers;
}


//	****************************************
// 	Collects all layers underneat into array
//	****************************************
function collectClippingLayers( )
{
	var i = layerIndex;
	var currentLayer = layerParent.layers[ i ];
  var collectedLayers = [];

	while ( currentLayer.grouped == true )
	{
		currentLayer = layerParent.layers[ i ];

		// If current layer is a folder ("grouped") then collectLayersBelow
		if ( currentLayer.typename == "LayerSet" ) collectLayersBelow( 0, currentLayer );

		if ( currentLayer.typename == "ArtLayer" ) collectedLayers.push( currentLayer );
		i++;
	}

  return collectedLayers;
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
