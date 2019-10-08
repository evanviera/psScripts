/*
		---------------------------------------------------------------------------

		Various functions use throughout these PS scripts.

		Evan Viera -- hello@evanviera.com

		---------------------------------------------------------------------------
*/



/*
		-------------------------------------------------------------

						Layer is the kind of layer you paint on

		-------------------------------------------------------------
*/
function validateLayer( __layer )
{
	if ( __layer.kind == LayerKind.NORMAL )
	{
		if ( __layer.typename == "ArtLayer" )
		{
			if ( __layer.visible == true)
			{
					return true;
			}
		}
	}
	return false;
}




/*
		-------------------------------------------------------------

						Returns index of layer

		-------------------------------------------------------------
*/
function getIndex( __selectedLayer )
{
	var index = 0;
	while ( __selectedLayer.parent.layers[ index ] != __selectedLayer )
	{
		index++;
	}
	return index;
}



/*
		------------------------------------------------

		Recursively collects nested layers into an array.

		------------------------------------------------
*/
function collectLayersBelow( __index, __parent )
{
	var _collectedLayers = [ ];

	for ( var i = __index; i < __parent.layers.length; i++ )
	{
		var currentLayer = __parent.layers[ i ];
		var isvalid = validateLayer( currentLayer );

		if ( currentLayer.typename == "LayerSet" )
		{
			collectLayersBelow( 0, currentLayer );
		} else if ( isvalid == true )
		{
			_collectedLayers.push( currentLayer );
			currentLayer.allLocked = false;
		}
	}
	return _collectedLayers;
}



/*
		------------------------------------------------

		Collects clipping layers into an array If it
		finds an layerset, then CollectLayersBelow.

		------------------------------------------------
*/
function collectClippingLayers( __index, __parent )
{
	var _collectedLayers = [ ];
	var currentLayer = __parent.layers[ __index ];

	while ( currentLayer.grouped == true )
	{
		// If current layer is a folder (LayerSet) then collectLayersBelow
		if ( currentLayer.typename == "LayerSet" )
		{
			var layersFromSet = collectLayersBelow( 0, currentLayer );
			_collectedLayers.push( layersFromSet );
		}
		else if ( currentLayer.typename == "ArtLayer" )
		{
			_collectedLayers.push( currentLayer );
		}
		currentLayer = layerParent.layers[ ++__index ];
	}

  return _collectedLayers;
}



//	---------------------------------------------------------------------------
//
// 	Executes actions for all layers in array
//
//	---------------------------------------------------------------------------
function copyAndMergeSelectedLayer( __selectedLayer, __collectedLayers )
{
	for ( var i = 0; i < __collectedLayers.length; i++ )
	{
		var duplicatedLayer = __selectedLayer.duplicate( __collectedLayers[ i ],
														ElementPlacement.PLACEBEFORE );
		duplicatedLayer.grouped = true;
		duplicatedLayer.merge( );
	}
}



/*
	---------------------------------------------------------------------------

 	Proof - Copy and Paste

	---------------------------------------------------------------------------
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
		------------------------------------------------

		Converts RGB to Mask
		This was generated using the script listener,
		it will convert the RGB channels into a matte.

		------------------------------------------------
*/
function convertRGBToMask( )
{
	var doc = activeDocument;

  // Load Red channel to selection
  doc.selection.load( doc.channels.getByName( 'Red' ), SelectionType.REPLACE );
	doc.selection.load( doc.channels.getByName( 'Green' ), SelectionType.EXTEND );
	doc.selection.load( doc.channels.getByName( 'Blue' ), SelectionType.EXTEND );

	// Create mask from selection
	var idMk = charIDToTypeID( "Mk  " );
		var desc156 = new ActionDescriptor();
		var idNw = charIDToTypeID( "Nw  " );
		var idChnl = charIDToTypeID( "Chnl" );
		desc156.putClass( idNw, idChnl );
		var idAt = charIDToTypeID( "At  " );
			var ref77 = new ActionReference();
			var idChnl = charIDToTypeID( "Chnl" );
			var idChnl = charIDToTypeID( "Chnl" );
			var idMsk = charIDToTypeID( "Msk " );
			ref77.putEnumerated( idChnl, idChnl, idMsk );
		desc156.putReference( idAt, ref77 );
		var idUsng = charIDToTypeID( "Usng" );
		var idUsrM = charIDToTypeID( "UsrM" );
		var idRvlS = charIDToTypeID( "RvlS" );
		desc156.putEnumerated( idUsng, idUsrM, idRvlS );
	executeAction( idMk, desc156, DialogModes.NO );
}



/*
		------------------------------------------------

		Checks to see if active layer has a layer mask

		------------------------------------------------
*/
function hasLayerMask( )
{
   var ref = new ActionReference( );
   ref.putEnumerated( stringIDToTypeID( "layer" ),
	 		charIDToTypeID( "Ordn" ), charIDToTypeID( "Trgt" ) );
   var Mask = executeActionGet( ref );
   return Mask.hasKey( charIDToTypeID( 'Usrs' ) );
}



/*
		------------------------------------------------

		Loads the Layer Mask of the current layer

		------------------------------------------------
*/
function layerMaskToSelection( )
{
	var idsetd = charIDToTypeID( "setd" );
	    var desc14 = new ActionDescriptor();
	    var idnull = charIDToTypeID( "null" );
	        var ref8 = new ActionReference();
	        var idChnl = charIDToTypeID( "Chnl" );
	        var idfsel = charIDToTypeID( "fsel" );
	        ref8.putProperty( idChnl, idfsel );
	    desc14.putReference( idnull, ref8 );
	    var idT = charIDToTypeID( "T   " );
	        var ref9 = new ActionReference();
	        var idChnl = charIDToTypeID( "Chnl" );
	        var idChnl = charIDToTypeID( "Chnl" );
	        var idMsk = charIDToTypeID( "Msk " );
	        ref9.putEnumerated( idChnl, idChnl, idMsk );
	    desc14.putReference( idT, ref9 );
	executeAction( idsetd, desc14, DialogModes.NO );
}



/*
		------------------------------------------------

		Sets the layer label color for SELECTED
		Options are: 	"Rd  ", "Orng", "Ylw ", "Grn ",
		"Bl  ", "Vlt ", "Gry ", "None"

		------------------------------------------------
*/
function setLabelColor( setTo )
{
	var idsetd = charIDToTypeID( "setd" );
		var desc85 = new ActionDescriptor();
		var idnull = charIDToTypeID( "null" );
			var ref33 = new ActionReference();
			var idLyr = charIDToTypeID( "Lyr " );
			var idOrdn = charIDToTypeID( "Ordn" );
			var idTrgt = charIDToTypeID( "Trgt" );
			ref33.putEnumerated( idLyr, idOrdn, idTrgt );
		desc85.putReference( idnull, ref33 );
		var idT = charIDToTypeID( "T   " );
			var desc86 = new ActionDescriptor();
			var idClr = charIDToTypeID( "Clr " );
			var idClr = charIDToTypeID( "Clr " );
			var idRd = charIDToTypeID( setTo );
			desc86.putEnumerated( idClr, idClr, idRd );
		var idLyr = charIDToTypeID( "Lyr " );
		desc85.putObject( idT, idLyr, desc86 );
	executeAction( idsetd, desc85, DialogModes.NO );

	return;
}
