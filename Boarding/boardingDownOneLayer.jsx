<javascriptresource>
	<name>Boarding - Down one layer</name>
	<about>

	</about>
	<category>Viera</category>
	<enableinfo>true</enableinfo>
</javascriptresource>

#include "../vieraLibrary.jsx"

// Create tag for layers named BG or Bar
var skip = new RegExp( /BG|Bar/gim );

// Get doc
var doc = activeDocument;

// Set group, layer length, and selection.
var grp = doc.activeLayer.parent;
var len = grp.layers.length - 1;
var sel = getIndex( doc.activeLayer );

// Store intial layer
var lyr = grp.layers[ sel ];

doShit( );

function doShit( )
{
	// If at the very bottom of the document, return.
	if ( ( sel == len ) && ( getIndex( grp ) == ( grp.parent.layers.length - 1 ) ) )
	{
		return;
	}

	// If at the bottom of the layer stack in a group.
	if ( sel == len )
	{
		// Turn group visibility off
		grp.visible = false;

		// Get index position of the grp
		sel = getIndex( grp );

		// Get the group above it.
		grp = grp.parent.layers[ sel + 1 ];

		// Update selection to the last layer in new group.
		sel =  -1;

		// Recurse
		doShit( );
	}
	else
	{
		// Increment selection
		sel++;
	}

	// Skip layers named BG or Bar
	if ( grp.layers[ sel ].name.match( skip ) )
	{
		doShit( );
	}

	// Turn off visibility for initial layer
	lyr.visible = false;

	// Make current layer visible.
	grp.layers[ sel ].visible = true;

	// And it's parent.
	grp.visible = true;

	// Update active layer
	doc.activeLayer = grp.layers[ sel ];
}
