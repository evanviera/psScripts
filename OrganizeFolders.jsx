<javascriptresource>
  <name>Organize Folders</name>
  <about>
      This will color code nested folders to help readiblity.
      It will also rename layers.
      - Evan Viera
  </about>
  <menu>filter</menu>
  <category>Viera</category>
  <type>automate</type>
  <enableinfo>true</enableinfo>
  </javascriptresource>

var doc = activeDocument;
var idColors = [ "Rd  ", "Orng", "Ylw ", "Grn ", "Bl  ", "Vlt ", "Gry " ];
var lastColor = 0;

colorGroupTags( doc );

//	****************************************
// 	Collects all layers underneat into array
//	****************************************
function colorGroupTags( __parent )
{
    for ( var i = 0; i < __parent.layers.length; i++ ) {

		var currentLayer = __parent.layers[ i ];
        if ( currentLayer.typename == "ArtLayer" )
		{
			currentLayer.name = "LYR_" + i;
		}
		else
		{
			doc.activeLayer = currentLayer;
			setLabelColor( idColors[ lastColor ] );
			lastColor = (lastColor + 1) % idColors.length;
			currentLayer.name = "GRP_" + i;

			colorGroupTags( currentLayer );
		}
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
