<javascriptresource>
<name>-- TESTBED --</name>
<menu>filter</menu>
<category>Viera</category>
<type>automate</type>

<about>This will bake the selected adjustment layers to ALL layers below. - by Evan Viera</about>
<enableinfo>true</enableinfo>
</javascriptresource>

var doc = activeDocument;
var selectedLayer = doc.activeLayer;

var alertString = "" + selectedLayer.typename + ",  " + selectedLayer.kind;

alert( alertString );

// doc.selection.load( doc.channels.getByName('Red') );

/*

app.activeDocument.channels.getByName( 'Red' );

var channelRef = [
  doc.channels.getByName('Red'),
  doc.channels.getByName('Green'),
  doc.channels.getByName('Blue')
  ];

var layerParent = selectedLayer.parent;
var collectedLayers = [];
var layerIndex = 0;

// =======================================================

var idtoolModalStateChanged = stringIDToTypeID( "toolModalStateChanged" );
    var desc517 = new ActionDescriptor();
    var idLvl = charIDToTypeID( "Lvl " );
    desc517.putInteger( idLvl, 1 );
    var idStte = charIDToTypeID( "Stte" );
    var idStte = charIDToTypeID( "Stte" );
    var identer = stringIDToTypeID( "enter" );
    desc517.putEnumerated( idStte, idStte, identer );
    var idTool = charIDToTypeID( "Tool" );
        var desc518 = new ActionDescriptor();
        var idIdnt = charIDToTypeID( "Idnt" );
        desc518.putString( idIdnt, """pntb""" );
        var idTtl = charIDToTypeID( "Ttl " );
        desc518.putString( idTtl, """Brush Tool""" );
    var idTool = charIDToTypeID( "Tool" );
    desc517.putObject( idTool, idTool, desc518 );
    var idKnd = charIDToTypeID( "Knd " );
    var idKnd = charIDToTypeID( "Knd " );
    var idPnt = charIDToTypeID( "Pnt " );
    desc517.putEnumerated( idKnd, idKnd, idPnt );
    var idkcanDispatchWhileModal = stringIDToTypeID( "kcanDispatchWhileModal" );
    desc517.putBoolean( idkcanDispatchWhileModal, true );
executeAction( idtoolModalStateChanged, desc517, DialogModes.NO );

// =======================================================
var idtoolModalStateChanged = stringIDToTypeID( "toolModalStateChanged" );
    var desc519 = new ActionDescriptor();
    var idLvl = charIDToTypeID( "Lvl " );
    desc519.putInteger( idLvl, 0 );
    var idStte = charIDToTypeID( "Stte" );
    var idStte = charIDToTypeID( "Stte" );
    var idexit = stringIDToTypeID( "exit" );
    desc519.putEnumerated( idStte, idStte, idexit );
    var idTool = charIDToTypeID( "Tool" );
        var desc520 = new ActionDescriptor();
        var idIdnt = charIDToTypeID( "Idnt" );
        desc520.putString( idIdnt, """pntb""" );
        var idTtl = charIDToTypeID( "Ttl " );
        desc520.putString( idTtl, """Brush Tool""" );
    var idTool = charIDToTypeID( "Tool" );
    desc519.putObject( idTool, idTool, desc520 );
    var idKnd = charIDToTypeID( "Knd " );
    var idKnd = charIDToTypeID( "Knd " );
    var idPnt = charIDToTypeID( "Pnt " );
    desc519.putEnumerated( idKnd, idKnd, idPnt );
    var idkcanDispatchWhileModal = stringIDToTypeID( "kcanDispatchWhileModal" );
    desc519.putBoolean( idkcanDispatchWhileModal, true );
executeAction( idtoolModalStateChanged, desc519, DialogModes.NO );




var idColors = [ "Rd  ", "Orng", "Ylw ", "Grn ", "Bl  ", "Vlt ", "Gry " ];
var lastColor = 0;

alert( selectedLayer.name );

// group layer vegetables
var allLayers = new Array();
var artLayers = new Array();
var theLayers = collectAllLayers(app.activeDocument, 0);


var artLayerNames = "";
// loop over art layers backwards
for (var i = artLayers.length -1; i >= 0  ; i--)
{
  var temp = artLayers[i];
  var regEx = new RegExp(/t/gim);
  if (temp.match(regEx))
  {
    // if the layer contains the letter "t" show it!
    alert(temp);
  }
  artLayerNames+= artLayers[i] + "\n";
}

// print out all layers
alert(artLayerNames);



// function collect all layers
function collectAllLayers (theParent, level)
{
  for (var m = theParent.layers.length - 1; m >= 0; m--)
  {
    var theLayer = theParent.layers[m];
    // apply the function to layersets;
    if (theLayer.typename == "ArtLayer")
    {
      // get the art layers
      artLayers.push(theLayer.name);
    }
    else
    {
      allLayers.push(level + theLayer.name);
      collectAllLayers(theLayer, level + 1)
    }
  }
}

layerIndex = getIndex( );

if ( selectedLayer.grouped == true )
{
	collectClippingLayersBelow( );
}
else
{
	collectLayersBelow( layerIndex, layerParent );
}

executeTempAction( );

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
// 	Collects all layers underneat into array
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
function collectClippingLayersBelow( )
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
function executeTempAction( )
{
	for ( var i = 0; i < collectedLayers.length; i++ ) {
		doc.activeLayer = collectedLayers[i];
		doc.activeLayer.name = doc.activeLayer.parent + i;
		setLabelColor( idColors[ lastColor ] );
		lastColor = (lastColor + 1) % idColors.length;
	}
}


//	****************************************
// 	Sets label color to parameters def
//	****************************************
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

*/
