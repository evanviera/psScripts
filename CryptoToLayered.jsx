<javascriptresource>
  <name>Cryptomatte to Layered PSD</name>
  <about>
      This will convert an exr cyrptomatte file to a layered PSD.
  		This assumes that the EXR was unpacked by EXR-IO
  		https://www.exr-io.com/
  		Evan Viera
  </about>
  <enableinfo>true</enableinfo>
  <menu>filter</menu>
  <category>Viera</category>
  <type>automate</type>
  </javascriptresource>

var doc = activeDocument;
var layerIndex = 0;
var rgbLayer;

// Collect all Cryptomatte Layers
var cryptoLayers = getAllCrypoLayers( );

// Find "RenderLayer.Combined.RGBA" and store as variable rgbLayer
// Disable the visibility for all layers. Important for the RGB to A function.
for ( var i = 0; i < doc.layers.length; i++ )
{
	if ( doc.layers[ i ].name == "RenderLayer.Combined.RGBA" ) rgbLayer = doc.layers[ i ];
	doc.layers[ i ].visible = false;
}


// Loop Through Crypto and convert RGB to A
for ( var i = 0; i < cryptoLayers.length; i++ )
{
	var currentLayer = cryptoLayers[ i ];
	currentLayer.visible = true;

	var convertedLayer = applyCryptoToRgbLayer( currentLayer );
	convertedLayer.visible = false;
}


// Make all newly created layers visible.
for ( var i = 0; i < cryptoLayers.length; i++ ) cryptoLayers[ i ].visible = true;






/*		------------------------------------------------

		Main function.

		This will call the convert
		function that transfors RGB into the layer's
		matte. Then will duplicate the RGB layer and
		flatten it.

		------------------------------------------------
*/
function applyCryptoToRgbLayer( __cryptoLayer )
{
	doc.activeLayer = __cryptoLayer;
	convertColorToMask();

	var rgbDuplicate = rgbLayer.duplicate( __cryptoLayer, ElementPlacement.PLACEBEFORE );
		rgbDuplicate.grouped = true;

	return rgbDuplicate.merge( );
}


/*		------------------------------------------------

		Loops through and collects all crypto layers that
		it finds via the regex expression.

		------------------------------------------------
*/
function getAllCrypoLayers( )
{
	var collectedLayers = [];
	var regEx = new RegExp( /CryptoObject/gim );

	for ( var i = 0; i < doc.layers.length; i++ )
	{
		var currentLayer = doc.layers[ i ];
		if ( currentLayer.name.match( regEx ) )
		{
			collectedLayers.push( currentLayer );
		}
	}

	return collectedLayers;
}



/*		------------------------------------------------

		This was generated using the script listener,
		it will convert the RGB channels into a matte.

		------------------------------------------------
*/
function convertColorToMask( )
{
  // Load Red channel to selection
  doc.selection.load( doc.channels.getByName('Red') );

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
