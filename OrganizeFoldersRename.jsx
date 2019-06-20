<javascriptresource>
  <name>Organize Folders and Rename</name>
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

#include "vieraLibrary.jsx"

/*

    NOTE: Running this currently makes all layers visible. This script needs
    to catch whether they are visible or are not and set them back to as they
    were. This could be done with a 2D array where the visiblity is recorded
    next to the index number.

*/



var doc = activeDocument;
var idColors = [ "Rd  ", "Orng", "Ylw ", "Grn ", "Bl  ", "Vlt ", "Gry " ];
var lastColor = 0;

colorGroupTags( doc );

//	****************************************
// 	Collects all layers underneat into array
//	****************************************
function colorGroupTags( __parent )
{
    for ( var i = 0; i < __parent.layers.length; i++ )
    {

      var currentLayer = __parent.layers[ i ];
      var visible = currentLayer.visible;

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

      currentLayer.visible = visible;
    }
}
