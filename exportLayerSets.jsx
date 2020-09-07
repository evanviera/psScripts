<javascriptresource>
	<name>Color Scripts: Export Top-level Layer Sets</name>
	<about>
			This will export top level.
      Layer-sets. It will ignore folders named "_REF_".
			AND it requires folders to have masks.
	</about>
	<category>Viera</category>
	<enableinfo>true</enableinfo>
	</javascriptresource>

#include "vieraLibrary.jsx"

app.displayDialogs = DialogModes.NO;

var doc = app.activeDocument;
var docRef;

// Set compresisong settings for PNG
var pngSaveOptions = new PNGSaveOptions( );
		pngSaveOptions.compression = 2;

var refLayer = new RegExp( /_REF_/gim );

var docName = new String( doc.name );
		docName = docName.slice( 0 , -4 );

// Set path for export, and create folder if it doesn't exist.
var outputPngPath = new Folder( doc.path + "/PNG/" + docName + "/" );

if ( !outputPngPath.exists ) outputPngPath.create( );

for ( var i = doc.layers.length - 1; i >= 0; i-- )
{
  if ( doc.layers[ i ].typename == "LayerSet" )
	{
		if ( !doc.layers[ i ].name.match( refLayer ) )
		{
			doc.activeLayer = doc.layers[ i ];
			if ( !hasLayerMask( ) )
			{
				alert( "LayerSet Requires Mask" );
			}
			else
			{
				layerMaskToSelection( );

				var grpName = new String( doc.layers[ i ].name );
						grpName = grpName.slice( 3 );

				var outputPngFile = new File( outputPngPath + "/" + docName +
																		grpName + ".png" );

				doc.selection.copy( true );
				var w = doc.selection.bounds[ 2 ];
				var h = doc.selection.bounds[ 3 ];
				docRef = app.documents.add( w, h );
				docRef.paste( );
				docRef.trim( TrimType.TOPLEFT, true, true, true, true );
				docRef.trim( TrimType.BOTTOMRIGHT, true, true, true, true );

				docRef.saveAs( outputPngFile, pngSaveOptions, true, Extension.LOWERCASE );
				docRef.close( SaveOptions.DONOTSAVECHANGES );
			}
		}
	}
}
