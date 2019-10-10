<javascriptresource>
	<name>Export Top-level Layer Sets</name>
	<about>
			This will export top level
      Layer-sets
	</about>
	<category>Viera</category>
	<enableinfo>true</enableinfo>
	</javascriptresource>

#include "vieraLibrary.jsx"

app.displayDialogs = DialogModes.NO;

var doc = app.activeDocument;
var docRef;
var pngSaveOptions = new PNGSaveOptions( );
		pngSaveOptions.compression = 9;

var refLayer = new RegExp( /_REF_/gim );

for ( var i = doc.layers.length - 1; i >= 0; i-- )
{
  if ( doc.layers[ i ].typename == "LayerSet" )
	{
		if ( !doc.layers[ i ].name.match( refLayer ) )
		{
			doc.activeLayer = doc.layers[ i ];
			layerMaskToSelection( );

			var docName = new String( doc.name );
					docName = docName.slice( 0 , -4 );

			var grpName = new String( doc.layers[ i ].name );
					grpName = grpName.slice( 3 );

			var outputPath = new File( 	doc.path + "/png/" + docName +
																	grpName + ".png" );

			app.activeDocument.selection.copy( true );
			var w = app.activeDocument.selection.bounds[ 2 ];
			var h = app.activeDocument.selection.bounds[ 3 ];
			docRef = app.documents.add( w, h );
			docRef.paste( );
			docRef.trim( );
			docRef.trim( );

			docRef.saveAs( outputPath, pngSaveOptions, true, Extension.LOWERCASE );
			docRef.close( SaveOptions.DONOTSAVECHANGES );
		}
	}
}
