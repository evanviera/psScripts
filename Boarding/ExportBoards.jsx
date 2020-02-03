<javascriptresource>
	<name>Boarding - Export - Real Deal</name>
	<about>

	</about>
	<category>Viera</category>
	<enableinfo>true</enableinfo>
</javascriptresource>

#include "../vieraLibrary.jsx"

// Init active Doc
var doc = app.activeDocument;

// Init export docs
var docBgExport = app.documents.add( doc.width, doc.height, 72, "BgExport" );
var docAnimExport = app.documents.add( doc.width, doc.height, 72, "AnimExport", NewDocumentMode.RGB, DocumentFill.TRANSPARENT );

// Make doc the active one. Needed to be able to duplicate layers
app.activeDocument = doc;

// Init save options
var pngSaveOptions = new PNGSaveOptions( );
	pngSaveOptions.compression = 2;

// Init save path
var outputPngPath = new Folder( doc.path + "/png/" );

// Create path if it doesn't exist
if ( !outputPngPath.exists ) outputPngPath.create( );

// Create Regular Expressions
var bar = new RegExp( /Bar/gim );
var bg = new RegExp( /BG/gim );



// Loop through all base layers in the doc.
for ( var i = doc.layers.length - 1; i >= 0; i-- )
{
	var lyr = doc.layers[ i ];

	// If it's a Layeset, go into it.
	if ( lyr.typename == "LayerSet" )
	{
		var frame = 0;
		// Loop through all layers in the layerset.
		for ( var j = lyr.layers.length - 1; j >= 0; j-- )
		{
			// If layer is a BG copy it to BgExport
			if ( lyr.layers[ j ].name.match( bg ) )
			{
				lyr.layers[ j ].duplicate( docBgExport, ElementPlacement.PLACEBEFORE.beforeLayer );
				lyr.layers[ j ].visible = true;
			}
			else if ( lyr.layers[ j ].name.match( bar ) )
			{
				// Do nothing
			}
			else
			{
				lyr.layers[ j ].duplicate( docAnimExport, ElementPlacement.PLACEBEFORE.beforeLayer );
				lyr.layers[ j ].visible = true;
				var outputPngFile = new File( doc.path + "/png/" + doc.layers[ i ].name + "_anim_" + frame++ + ".png" );
				app.activeDocument = docAnimExport;
				docAnimExport.saveAs( outputPngFile, pngSaveOptions, true, Extension.LOWERCASE );
				docAnimExport.layers[ 0 ].remove( );
				app.activeDocument = doc;
			}
		}
		// Save out the BgExport
		var outputPngFile = new File( doc.path + "/png/" + doc.layers[ i ].name + "_BG.png" );
		app.activeDocument = docBgExport;
		docBgExport.saveAs( outputPngFile, pngSaveOptions, true, Extension.LOWERCASE );
		app.activeDocument = doc;
	}
}

alert( "Done" );
