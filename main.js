import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { randFloat, randInt } from 'three/src/math/MathUtils';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';


const startButton = document.getElementById( 'startButton' );
startButton.addEventListener( 'click', init );

function init(){
    const overlay = document.getElementById( 'overlay' );
	overlay.remove();

    // ThreeJS build pattern
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    document.body.appendChild(renderer.domElement);

    // Spot Light
    const spotLight = new THREE.SpotLight( 0xffffff );
    spotLight.position.set( 100, 10, 100 );
    spotLight.castShadow = true;
    scene.add( spotLight );


    // Loader gun
    const loader = new GLTFLoader();

    // Gun
    let base = new THREE.Object3D();
    scene.add(base);
    loader.load( '/Glock18.gltf', 
        function ( gltf ){
            gltf.scene.scale.setScalar(1)
            base.add( gltf.scene );
        }, 
        function ( texture ){
            // in this example we create the material when the texture is loaded
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.flipY = true;
        },
        undefined, function ( error ){
            console.error( error );
    });

    // Group Gun 
    const group = new THREE.Group();
    group.add(base)
    scene.add(group)
    base.position.set(1,-1,0)
    group.position.set(-2, -1, 15)

    // Plane Floor
    const map = new THREE.TextureLoader().load( '/sprite.jpg' );
    const planeGeometry = new THREE.PlaneGeometry(50, 50, 40, 40);
    const planeMaterial = new THREE.MeshStandardMaterial( {map: map} )
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = 4.8
    plane.position.y = -5
    plane.receiveShadow = true;
    scene.add( plane );

    // back wall
    const planeGeometry2 = new THREE.PlaneGeometry(50, 50, 40, 40);
    const planeMaterial2 = new THREE.MeshStandardMaterial( {color: 0x000000} )
    const back = new THREE.Mesh(planeGeometry2, planeMaterial2);
    back.receiveShadow = true;
    back.position.z = -15
    scene.add( back );

    // left wall
    const cs = new THREE.TextureLoader().load( '/csgo.jpg' );
    const planeGeometry3 = new THREE.PlaneGeometry(50, 40, 40, 40);
    const planeMaterial3 = new THREE.MeshStandardMaterial( {map: cs} )
    const left = new THREE.Mesh(planeGeometry3, planeMaterial3);
    left.receiveShadow = true;
    left.rotation.y = Math.PI/2
    left.position.y = 5
    left.position.x = -25
    scene.add( left );

    // right wall
    const medal = new THREE.TextureLoader().load( '/medal.jpg' );
    const planeGeometry4 = new THREE.PlaneGeometry(10, 20, 50, 20);
    const planeMaterial4 = new THREE.MeshStandardMaterial( {map: medal} )
    const right = new THREE.Mesh(planeGeometry4, planeMaterial4);
    right.receiveShadow = true;
    right.rotation.y = -0.5
    right.position.y = 5
    right.position.z = -1
    right.position.x = 20
    scene.add( right );

    // score
    const scoreGroup = new THREE.Group();
    let scoreManager = { 
        score: 0,
        try: 0,
        font: undefined,
        scoreMesh: null,
        fontUri: 'node_modules/three/examples/fonts/gentilis_regular.typeface.json',
        createScoreMeshInScene: (scoreValue, scene) => {
            new FontLoader().load( scoreManager.fontUri, (response) => scoreManager.font = response )
            const textGeom = new TextGeometry( `score: ${scoreValue}`, {
                font: scoreManager.font,
                size: 2,
                height: 3,
                curveSegments: 12,
            })

            textGeom.computeBoundingBox()
            const centerOffset = - 0.5 * ( textGeom.boundingBox.max.x - textGeom.boundingBox.min.x )

            scoreManager.scoreMesh = new THREE.Mesh( textGeom, new THREE.MeshStandardMaterial())

            scoreManager.scoreMesh.position.x = centerOffset - 17
            scoreManager.scoreMesh.position.y = 22
            scoreManager.scoreMesh.position.z = -18
            
            scoreManager.scoreMesh.rotation.x = 0
            scoreManager.scoreMesh.rotation.y = Math.PI * 2
            
            scene.add(scoreManager.scoreMesh)
            
        },
        updateScoreMeshInScene: (scene) => { 
            if (scoreManager.scoreMesh !== null) {
                scene.remove(scoreManager.scoreMesh)
                scoreManager.createScoreMeshInScene(scoreManager.score, scene)
            }
        },
        countPoint: () => scoreManager.score += 1,
        coutTry: () => scoreManager.try += 1
    };

    scoreManager.createScoreMeshInScene(0, scoreGroup)
    scene.add(scoreGroup)

    function calculateScore(){
        if(timeManager.time < 40){
            scoreManager.countPoint();
            scoreManager.updateScoreMeshInScene(scene);
        }
    }

    function calculateTry(){
        if(timeManager.time < 40){
            scoreManager.coutTry();
        }
    }


    // Time
    let seconds = new THREE.Clock()
    const timeGroup = new THREE.Group();
    let timeManager = { 
        time: 0,
        font: undefined,
        timeMesh: null,
        fontUri: 'node_modules/three/examples/fonts/gentilis_regular.typeface.json',
        createTimeMeshInScene: (timeValue, scene) => {
            new FontLoader().load( timeManager.fontUri, (response) => timeManager.font = response )
            const textGeom = new TextGeometry( `time: ${timeValue}`, {
                font: timeManager.font,
                size: 2,
                height: 3,
                curveSegments: 12,
            })

            textGeom.computeBoundingBox()
            const centerOffset = - 0.5 * ( textGeom.boundingBox.max.x - textGeom.boundingBox.min.x )

            timeManager.timeMesh = new THREE.Mesh( textGeom, new THREE.MeshStandardMaterial())

            timeManager.timeMesh.position.x = centerOffset 
            timeManager.timeMesh.position.y = 22
            timeManager.timeMesh.position.z = -18
            
            timeManager.timeMesh.rotation.x = 0
            timeManager.timeMesh.rotation.y = Math.PI * 2
            
            scene.add(timeManager.timeMesh)
            
        },
        updateTimeMeshInScene: (scene) => { 
            if (timeManager.timeMesh !== null) {
                scene.remove(timeManager.timeMesh)
                timeManager.createTimeMeshInScene(timeManager.time, scene)
            }
        },
        countPoint: () => timeManager.time = seconds.getElapsedTime().toFixed(2)
    };

    timeManager.createTimeMeshInScene(0, timeGroup)
    scene.add(timeGroup)

    // calculate time
    function calculateTime(){
        if(timeManager.time < 40 && scoreManager.try > 0){
            timeManager.countPoint();
            timeManager.updateTimeMeshInScene(scene);
            meanManager.meanCalculator();
            meanManager.updateMeanMeshInScene(scene);
        }
        renderer.render(scene, camera);
    }

    // mean 
    const meanGroup = new THREE.Group();
    let meanManager = { 
        mean: '',
        try: 0,
        font: undefined,
        meanMesh: null,
        fontUri: 'node_modules/three/examples/fonts/gentilis_regular.typeface.json',
        createMeanMeshInScene: (meanValue, scene) => {
            new FontLoader().load( meanManager.fontUri, (response) => meanManager.font = response )
            const textGeom = new TextGeometry( `mean: ${meanValue}`, {
                font: meanManager.font,
                size: 2,
                height: 3,
                curveSegments: 12,
            })

            textGeom.computeBoundingBox()
            const centerOffset = - 0.5 * ( textGeom.boundingBox.max.x - textGeom.boundingBox.min.x )

            meanManager.meanMesh = new THREE.Mesh( textGeom, new THREE.MeshStandardMaterial())

            meanManager.meanMesh.position.x = centerOffset + 17
            meanManager.meanMesh.position.y = 22
            meanManager.meanMesh.position.z = -18
            
            meanManager.meanMesh.rotation.x = 0
            meanManager.meanMesh.rotation.y = Math.PI * 2
            
            scene.add(meanManager.meanMesh)
            
        },
        updateMeanMeshInScene: (scene) => { 
            if (meanManager.meanMesh !== null) {
                scene.remove(meanManager.meanMesh)
                meanManager.createMeanMeshInScene(meanManager.mean, scene)
            }
        },
        meanCalculator: () => {
            meanManager.mean = scoreManager.score + '/' + scoreManager.try
        }
    };

    meanManager.createMeanMeshInScene(0, meanGroup)
    scene.add(meanGroup)

    // Create Spheres
    function makeSpheres(x, y){
        for(let i = -4; i < y; i++){
            for(let j = -4; j < x; j++){
                const geometry2 = new THREE.SphereGeometry(0.6);
                const material2 = new THREE.MeshPhongMaterial({color: 0x0000ff});
                const sphere = new THREE.Mesh(geometry2, material2);
                sphere.position.set(randFloat(j*2, j*2.5), randFloat(i*2, i*2.5), randFloat(0, 3));
                sphere.position.y += 9
                sphere.castShadow = true;
                sphere.receiveShadow = true;
                scene.add(sphere);
            }
        }
    }

    makeSpheres(3, 0)

    function makeOneSphere(spher){
        const geometry2 = new THREE.SphereGeometry(0.6);
        const material2 = new THREE.MeshPhongMaterial({color: 0x0000ff});
        const sphere = new THREE.Mesh(geometry2, material2);
        x = spher.position.x += randInt(-0.7, 0.7);
        z = spher.position.x += randInt(-0.7, 0.7);
        z = spher.position.z += randInt(0, 1.7)
        sphere.position.set(x, y, z);
        sphere.castShadow = true;
        sphere.receiveShadow = true;
        if(sphere.position.x > -5 &&
            sphere.position.x < 4)
            scene.add(sphere);
    }

    camera.position.set( 0, 0, 18);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enabled = false
    function onDocumentKeyDown(event) {
        var keyCode = event.which;

        switch (keyCode){
        case 69: // e - nable
            controls.enabled = true
            break;
        case 68: // d - isable
            controls.enabled = false
            break;
        case 82: // esc
            location.reload()
            break;
        case 27: // esc
            window.close()
            break;
        }
        renderer.render(scene, camera);
    };

    // Mouse Variables 
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let INTERSECTED; 

    function onPointerMove(event){
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
    }

    const plane2 = new THREE.Plane(new THREE.Vector3(0, 0, 2), 2);
    const mouse = new THREE.Vector2();
    const pointOfIntersection = new THREE.Vector3();

    function onMouseMove(event){
        mouse.x =  ((event.clientX / window.innerWidth) * 2 - 1); 
        mouse.y = (-(event.clientY / window.innerHeight) * 2 + 1);
        raycaster.setFromCamera(mouse, camera);
        raycaster.ray.intersectPlane(plane2, pointOfIntersection);
        group.lookAt(pointOfIntersection);
    }

    // Shoot
    const listener = new THREE.AudioListener();
    camera.add(listener);
    const sound = new THREE.Audio(listener);
    const utopiaElement = document.getElementById( 'song' );
	sound.setMediaElementSource( utopiaElement );
	sound.setVolume( 0.5 );
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load( '/shoot.ogg', function( buffer ) {
        sound.setBuffer( buffer );
        sound.setVolume( 0.5 );
    });

    async function mouseClick(){
        sound.play()
        utopiaElement.play();
        const tweenGo = new TWEEN.Tween({xRotation: group.rotation.x})
            .to({xRotation: group.rotation.x += 0.3}, 200)
            .onUpdate((coords) => {
                group.rotation.x = coords.xRotation;
            })
        tweenGo.start();

        const tweenBack = new TWEEN.Tween({xRotation: group.rotation.x})
            .to({xRotation: group.rotation.x -= 0.3}, 200)
            .onUpdate((coords) => {
                group.rotation.x = coords.xRotation;
            })
        tweenBack.start();

        calculateTry()

        if (scene.children[3] != INTERSECTED && 
            scene.children[4] != INTERSECTED &&
            scene.children[5] != INTERSECTED &&
            scene.children[6].children[0] != INTERSECTED){
                calculateScore();
                makeOneSphere(INTERSECTED);
                scene.remove(INTERSECTED);
            }
    }

    // Intersection with mouse pointer
    function mouseIntersect(){
        raycaster.setFromCamera(pointer, camera);

        const intersects = raycaster.intersectObjects( scene.children, false );
        if (intersects.length > 0){
            if (INTERSECTED != intersects[0].object && 
                scene.children[2] != intersects[0].object){
                if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
                
                INTERSECTED = intersects[0].object;
                INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
                if (scene.children[3] != INTERSECTED && 
                    scene.children[4] != INTERSECTED &&
                    scene.children[5] != INTERSECTED &&
                    scene.children[6].children[0] != INTERSECTED) INTERSECTED.material.emissive.setHex(0xff0000);
            }
        }
        renderer.render(scene, camera);
    }

    function animate(){
        requestAnimationFrame(animate);
        window.requestAnimationFrame(calculateTime);
        window.addEventListener("keydown", onDocumentKeyDown, false);
        TWEEN.update();
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('click', mouseClick, false);
        window.addEventListener("mousemove", onMouseMove, false);
        window.requestAnimationFrame(mouseIntersect)
        controls.update();
        renderer.render(scene, camera);
    }

    animate();
}