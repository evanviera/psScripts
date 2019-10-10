<javascriptresource>
	<name>Export Top-level Layer Sets</name>
	<about>
			This will export top level
      Layer-sets
	</about>
	<category>Viera</category>
	<enableinfo>true</enableinfo>
	</javascriptresource>

// var doc = activeDocument;
//
// for ( var i = 0; i < doc.layers.length; i++ )
// {
//   if ( doc.layers[ i ].typename == "LayerSet" )
// 	{
// 		alert( doc.layers[ i ].name );
// 	}
// }



var savePath = app.activeDocument.path + "/png/";
alert( savePath );

app.displayDialogs = DialogModes.NO;

var pngSaveOptions = new PNGSaveOptions();
pngSaveOptions.compression = 9;

var hasSelection;
var docRef;
try {
    hasSelection = !!app.activeDocument.selection.bounds;
} catch (err) {
    hasSelection = false;
}

if (hasSelection) {
    app.activeDocument.selection.copy(true);
    var w = app.activeDocument.selection.bounds[2];
    var h = app.activeDocument.selection.bounds[3];
    docRef = app.documents.add(w, h);
    docRef.paste();
		docRef.trim();
} else {
    docRef = app.activeDocument;
}
var file = File.saveDialog("Export as PNG to...");
if (file && ((file.exists && confirm("Overwrite " + file +"?")) || !file.exists)) {
    docRef.saveAs( new File( savePath+"asddf.png" ), pngSaveOptions, !hasSelection, Extension.LOWERCASE);
    if (hasSelection) {
    docRef.close(SaveOptions.DONOTSAVECHANGES);
    }
}
