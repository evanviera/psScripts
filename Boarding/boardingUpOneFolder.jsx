<javascriptresource>
	<name>Boarding - Up one Folder</name>
	<about>

	</about>
	<category>Viera</category>
	<enableinfo>true</enableinfo>
</javascriptresource>

#include "../vieraLibrary.jsx"

var doc = activeDocument;

// Go all the way up on the heierachy.
getParent( );

doShit( );


// Do shit
function doShit ( )
{
	// Get position of folder in stack.
	var sel = getIndex( doc.activeLayer );

	// Disable visibility
	doc.activeLayer.visible = false;

	// Increment and clamp to document length
	sel = Math.max( sel - 1, 0 );

	// Change active layer
	doc.activeLayer = doc.layers[ sel ];

	// Enable visibility
	doc.activeLayer.visible = true;
}


// Get parent function. Works be recussion.
function getParent( )
{
	if ( doc.activeLayer.parent != doc )
	{
		doc.activeLayer = doc.activeLayer.parent;
		getParent( );
	}

	return;
}
