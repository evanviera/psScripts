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
        if ( ( currentLayer.typename == "ArtLayer" )
						&& ( currentLayer.visible == true )
						&& ( currentLayer.kind == LayerKind.NORMAL ) )
				{
					collectedLayers.push( currentLayer );
				}
				else
				{
            collectLayersBelow( 0, currentLayer );
        }
	}
  return collectedLayers;
}


//	****************************************
// 	Collects all layers underneat into array
//	****************************************
function collectClippingLayers( __index, __parent )
{
	var currentLayer = __parent.layers[ __index ];
  var collectedLayers = [];

	while ( currentLayer.grouped == true )
	{
		// If current layer is a folder ("grouped") then collectLayersBelow
		if ( currentLayer.typename == "LayerSet" )
		{
			var layersFromSet = collectLayersBelow( 0, currentLayer );
			collectedLayers.push( layersFromSet );
		}
		else if ( currentLayer.typename == "ArtLayer" )
		{
			collectedLayers.push( currentLayer );
		}
		currentLayer = layerParent.layers[ ++__index ];
	}

  return collectedLayers;
}


//	****************************************
// 	Executes actions for all layers in array
//	****************************************
function copyAndMergeSelectedLayer( __selectedLayer, __collectedLayers )
{
	for ( var i = 0; i < __collectedLayers.length; i++ )
	{
		var duplicatedLayer = __selectedLayer.duplicate( __collectedLayers[ i ], ElementPlacement.PLACEBEFORE );
		// duplicatedLayer.grouped = ( duplicatedLayer.grouped == false ) ? true : true;
		duplicatedLayer.grouped = true;
		duplicatedLayer.merge( );
	}
}

//	****************************************
// 	Proof - Copy and Paste
//	****************************************
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
