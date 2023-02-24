if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

			var canvas;
			var scenes = [], renderer;
            var uniforms;

			init();
			animate();

			function init() {

				canvas = document.getElementById( "c" );
				var template = document.getElementById( "template" ).text;
				var content = document.getElementById( "content" );

                uniforms = {
                    u_time: { type: "f", value: 1.0 },
                    u_resolution: { type: "v2", value: (new THREE.Vector2()) },
                    u_mouse: { type: "v2", value: new THREE.Vector2() }
                };

				for ( var i =  0; i < 3; i ++ ) {

					var scene = new THREE.Scene();

					// make a list item
					var element = document.createElement( "div" );
					element.className = "list-item";
					element.innerHTML = template.replace( '$', i + 1 );

					// Look up the element that represents the area
					// we want to render the scene
					scene.userData.element = element.querySelector( ".scene" );
					content.appendChild( element );

                    var camera = new THREE.Camera();
                    camera.position.z = 1;
					scene.userData.camera = camera;

                    var geometry = new THREE.PlaneBufferGeometry( 2, 2 );

                    var material = new THREE.ShaderMaterial( {
                        uniforms: uniforms,
                        vertexShader: document.getElementById( 'vertexShader' ).textContent,
                        fragmentShader: document.getElementById( `fragmentShader${i}` ).textContent
                    } );

					scene.add( new THREE.Mesh( geometry, material ) );

					scenes.push( scene );

				}

				renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );
				renderer.setClearColor( 0xffffff, 1 );
				renderer.setPixelRatio( window.devicePixelRatio );

			}

			function updateSize() {

				var width = canvas.clientWidth;
				var height = canvas.clientHeight;

				if ( canvas.width !== width || canvas.height != height ) {
					renderer.setSize( width, height, false );
				}
			}

			function animate() {
				render();
				requestAnimationFrame( animate );
			}

			function render() {

				updateSize();
				renderer.setClearColor( 0xffffff );
				renderer.setScissorTest( false );
				renderer.clear();

				renderer.setClearColor( 0xe0e0e0 );
				renderer.setScissorTest( true );

				scenes.forEach( function( scene ) {
					// draw the scene
					var element = scene.userData.element;

					// get its position relative to the page's viewport
					var rect = element.getBoundingClientRect();

					// check if it's offscreen. If so skip it
					if ( rect.bottom < 0 || rect.top  > renderer.domElement.clientHeight ||
						 rect.right  < 0 || rect.left > renderer.domElement.clientWidth ) {

						return;  // it's off screen
					}

					// set the viewport
					var width  = rect.right - rect.left;
					var height = rect.bottom - rect.top;
					var left   = rect.left;
					var bottom = renderer.domElement.clientHeight - rect.bottom;

                    uniforms.u_resolution.value.x = renderer.domElement.width;
                    uniforms.u_resolution.value.y = renderer.domElement.height;

					renderer.setViewport( left, bottom, width, height );
					renderer.setScissor( left, bottom, width, height );

					var camera = scene.userData.camera;
					renderer.render( scene, camera );

				} );

			}