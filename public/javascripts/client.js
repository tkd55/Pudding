;(function(){
    
    var moveFlg = false;

    document.addEventListener('DOMContentLoaded', function(){
        var camera, scene, renderer, animeteId, renderId;
         
        init();
        initShaderMaterial();
        initScene();
        render();
        
        function init() {
            scene = new THREE.Scene();
         
            camera = new THREE.PerspectiveCamera( 75, 1, 1, 10000 );
            camera.position.z = 1000;
            scene.add( camera );
         
            div_canvas = document.getElementById( 'div_canvas' );
            renderer = new THREE.WebGLRenderer();
            renderer.setSize( 500, 500 );

            // 影の有効化（レンダラー）
            renderer.shadowMapEnabled = true; 
            // 光源（DirectionalLight）の生成
            var light = new THREE.DirectionalLight(0xFFFFFF, 1);
            // 影の有効化(光源) 
            light.castShadow = true;
            scene.add( light );

            div_canvas.appendChild( renderer.domElement );
            trackball = new THREE.TrackballControls( camera, renderer.domElement );
        }

        function initShaderMaterial() {
            uniforms = {
                fSinTime0_X: {
                    type: 'f',
                    value: 0
                },
                edgeColor: {
                    type: 'v4',
                    value: new THREE.Vector4(0, 0, 0, 0)
                },
                edge: {
                    type: 'i',
                    value: true
                },
            };
            attributes = {
            };
         
            shader_material = new THREE.ShaderMaterial( {
                // wireframe: true,
                // 頂点シェーダーのソースコード
                vertexShader: [ "uniform float fSinTime0_X;",
                                "varying vec3 pos;",
                                "void main(void)",
                                "{",
                                "   pos = position;",
                                "   pos.x = pos.x + 10.0 * cos( pos.x * fSinTime0_X );",
                                "   pos.y = pos.y + 10.0 * sin( pos.y * fSinTime0_X );",
                                "   ",
                                "   gl_Position = projectionMatrix * viewMatrix * vec4( pos, 1.0 );",
                                "}" ].join( "\n" ),
                // フラグメントシェーダーのソースコード
                fragmentShader: [ "varying vec3 pos;",
                                  "void main(void)",
                                  "{",
                                  "     if ( pos.y < 180.0 ){",
                                  "         gl_FragColor = vec4(1.0, 1.0, 0.6, 1.0);",
                                  "     } else {",
                                  "         gl_FragColor = vec4(0.2, 0.0, 0.0, 1.0);",
                                  "     }",
                                  "}"
                                ].join( "\n" ),
                uniforms: uniforms,
                attributes: attributes
            } );
        }
         
        function initScene() {
            // 円柱
            clinderGeometry = new THREE.CylinderGeometry(350, 500, 480, 128, 128, false);
            clinderMesh = new THREE.Mesh( clinderGeometry, shader_material );
            scene.add( clinderMesh );
        }
         
        var angle = 0;
        var angleFlg = false;
        var dtValue = 0;
        function animate() {
            // note: three.js includes requestAnimationFrame shim
            uniforms.fSinTime0_X.value = angle * 2 * Math.PI / 360;
            dtValue = Math.random() / 100;
            angle += 0.06;
            
            animeteId = requestAnimationFrame( animate );
            if(angleFlg === false){
                setTimeout(reverseAnimate, 500);
                angleFlg = true;
            }
        }

        function reverseAnimate(){
            // note: three.js includes requestAnimationFrame shim
            cancelAnimationFrame( animeteId );
            uniforms.fSinTime0_X.value = angle * 2 * Math.PI / 360;
            angle -= 0.06;
            
            animeteId = requestAnimationFrame( reverseAnimate );
            if(angleFlg === true){
                setTimeout(clearAnimate, 500);
                angleFlg = false;
            }
        }

        function clearAnimate(){
            uniforms.fSinTime0_X.value = 0;         // 初期化
            cancelAnimationFrame( animeteId );      // reverseAnimateのクリア
            moveFlg = false;
        }
         
        function render() {
            trackball.update();
            renderer.render( scene, camera );
            setTimeout(render);
        }

        // 引数を省略するとHTTPサーバと同じURLに接続する
        var socket = io.connect();
        
        // クライアントが接続したとき
        socket.on('connect', function(){
            console.log('クライアントが接続したよ');
        });
        
        // サーバからメッセージを受信をしてプルプルさせる
        socket.on('pulpulReq', function(data){
            console.log("----------- pulpulReq ------------");
            if(moveFlg != true){
                animate();
                moveFlg = true;
            }
        });
    });
    
})();
