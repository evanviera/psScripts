<javascriptresource>
	<name>Toggle Reference Layers</name>
	<about>
			This will toggle the visibility of layers
      with the prefix _REF_. This is for workflow
      speed and functionality.
	</about>
	<category>Viera</category>
	<enableinfo>true</enableinfo>
	</javascriptresource>

var doc = activeDocument;
var refLayer = new RegExp( /_REF_/gim );

for ( var i = 0; i < doc.layers.length; i++ )
{
	if ( doc.layers[ i ].name.match( refLayer ) )
  {
    doc.layers[ i ].visible = !doc.layers[ i ].visible;
  }
}
