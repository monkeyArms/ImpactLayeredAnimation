ig.module(
	'plugins.layeredAnimation'
)
.requires(
	'impact.animation'
)
.defines(function(){
				  
				  
	ig.AnimationSheet.inject({


		init: function( path, width, height )
		{
			this.parent( path, width, height );
			
			this.copyImage = new ig.Image( path+'?nocache=true' );
			this.layers	 = [];
			this.numLayers = 0;
			this.numActiveLayers = 0;
			this.composited = false;
			this.forceRedraw = false;
		},
		
		
		addLayer: function( path )
		{
			var found = false;
			
			for(i=0; i < this.numLayers; i++) {
				if (this.layers[i].img.path == path) {
					this.layers[i].active = true;	
					found = true;
				}
			}
			if (!found) {
				this.layers.push({
					img: new ig.Image( path ),
					active: true
				});
				this.numLayers++;
			}
			this.composited = false;
			this.numActiveLayers++;
		},
		
		
		removeLayer: function( path )
		{
			var found = false,
				i;
			
			for(i=0; i < this.numLayers; i++) {
				if (this.layers[i].img.path == path) {
					this.layers[i].active = false;
					this.numActiveLayers--;
					this.composited = false;
					this.forceRedraw = true;
					found = true;
				}
			}
			
			return found;
		}
		
	});

	
	ig.Animation.inject({	
		
		
		update: function()
		{
			var layersLoaded = true;
			
			if (!this.sheet.composited && (this.sheet.forceRedraw || this.sheet.numLayers > 0)) {
				
				if (!this.sheet.image.loaded || !this.sheet.copyImage.loaded) {
					layersLoaded = false;
				} else {
					for(i=0; i < this.sheet.numLayers; i++) {
						if (!this.sheet.layers[i].img.loaded) {
							layersLoaded = false;
							break;
						}
					}
				}

				if (layersLoaded) {
					this.sheet.composited = this.createComposite();
				}
			}

			this.parent();
		},
		
		
		createComposite: function()
		{
			var bufferCanvas = ig.$new( 'canvas' ),
				buffer = bufferCanvas.getContext( '2d' ),
				data,
				i;

			bufferCanvas.width = this.sheet.image.data.width;
			bufferCanvas.height = this.sheet.image.data.height;

			buffer.drawImage( this.sheet.copyImage.data, 0, 0 );
			for(i=0; i < this.sheet.numLayers; i++) {
				if (this.sheet.layers[i].active) {
					buffer.drawImage( this.sheet.layers[i].img.data, 0, 0 );
				}
			}

			data = bufferCanvas.toDataURL( 'image/png' );
			
			if (data != 'data:,') {
				this.sheet.image.data.src = data;
				this.sheet.forceRedraw = false;
				
				return true;
			}

			return false;
		}


	});
	
});
