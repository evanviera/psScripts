<javascriptresource>
	<name>Export Top-level Layer Sets</name>
	<about>
			This will export top level
      Layer-sets.
	</about>
	<category>Viera</category>
	<enableinfo>true</enableinfo>
	</javascriptresource>

#include "vieraLibrary.jsx"

app.displayDialogs = DialogModes.NO;

var doc = app.activeDocument;
var docRef;

var pngSaveOptions = new PNGSaveOptions( );
		pngSaveOptions.compression = 2;

var jpegSaveOptions = new JPEGSaveOptions( );
		jpegSaveOptions.quality = 12;
		jpegSaveOptions.embedColorProfile = true;
		jpegSaveOptions.matte = MatteType.BLACK;

var refLayer = new RegExp( /_REF_/gim );

var docName = new String( doc.name );
		docName = docName.slice( 0 , -4 );

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

				var outputPath = new File( 	doc.path + "/png/" + docName +
																		grpName + ".png" );

				doc.selection.copy( true );
				var w = doc.selection.bounds[ 2 ];
				var h = doc.selection.bounds[ 3 ];
				docRef = app.documents.add( w, h );
				docRef.paste( );
				docRef.trim( );
				docRef.trim( );

				docRef.saveAs( outputPath, pngSaveOptions, true, Extension.LOWERCASE );
				docRef.saveAs( outputPath, jpegSaveOptions, true, Extension.LOWERCASE );
				docRef.close( SaveOptions.DONOTSAVECHANGES );
			}
		}
	}
}
