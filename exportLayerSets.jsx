<javascriptresource>
	<name>Export Top-level Layer Sets</name>
	<about>
			This will export top level
      Layer-sets
	</about>
	<category>Viera</category>
	<enableinfo>true</enableinfo>
	</javascriptresource>

var doc = activeDocument;

for ( var i = 0; i < doc.layers.length; i++ )
{
  if ( doc.layers[ i ].typename == "LayerSet" )
	{
		alert( doc.layers[ i ].name );	
	}
}
