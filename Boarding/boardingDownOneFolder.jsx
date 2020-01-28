<javascriptresource>
	<name>Boarding - Down one Folder</name>
	<about>

	</about>
	<category>Viera</category>
	<enableinfo>true</enableinfo>
</javascriptresource>

#include "../vieraLibrary.jsx"

var doc = activeDocument;

// Go all the way up on the heierachy.
if ( doc.activeLayer.parent != doc )
{
	getParent( );
}


doShit( );


// Do shit
function doShit ( )
{
	// Get position of folder in stack.
	var sel = getIndex( doc.activeLayer );

	// Return if at the end of the stack
	if ( sel == doc.layers.length - 1 )
	{
		return;
	}

	// Disable visibility
	doc.activeLayer.visible = false;

	// Change active layer
	doc.activeLayer = doc.layers[ ++sel ];

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
