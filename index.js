const THREE = require('three');
const monsterFace = require('./Monster.png');
const monsterTongue = require('./Monster-2.png');
const winFont = require('./font.json');

const scene = new THREE.Scene();
const light = new THREE.DirectionalLight();
const raycaster = new THREE.Raycaster();
const loader = new THREE.TextureLoader();
const fontLoader = new THREE.FontLoader();
const mouse = new THREE.Vector3();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const basicMaterials = {
  yellow: new THREE.MeshBasicMaterial( { color: 0xffff00 } ),
  black: new THREE.MeshBasicMaterial( { color: 0x000000 } ),
  grey: new THREE.MeshBasicMaterial( { color: 0x222222 } ),
  white: new THREE.MeshBasicMaterial( { color: 0xffffff } ),
  red: new THREE.MeshBasicMaterial({ color: 0xff0000 }),
  pink: new THREE.MeshBasicMaterial({ color: 0xff69b4 }),
  skin: new THREE.MeshBasicMaterial({ color: 0xffad60 }),  
};

scene.background = basicMaterials.white;

const headGeom = new THREE.SphereGeometry(1, 8);
const headMat = basicMaterials.skin;
const head = new THREE.Mesh( headGeom, headMat );
scene.add( head );

const eyeGeom = new THREE.SphereGeometry(.1, 8);
const eyeMat = basicMaterials.black;

const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
const rightEye = new THREE.Mesh(eyeGeom, eyeMat);

leftEye.position.x += -.3;
leftEye.position.y += .15;
leftEye.position.z += 1;
head.add(leftEye);

rightEye.position.x += .3;
rightEye.position.y += .15;
rightEye.position.z += 1;
head.add(rightEye);
camera.position.z = 10;

function EllipticCurve() {
	THREE.Curve.call( this );
}

EllipticCurve.prototype = Object.create( THREE.Curve.prototype );
EllipticCurve.prototype.constructor = EllipticCurve;

EllipticCurve.prototype.getPoint = function ( t ) {
  t = t - Math.PI/1.5;
	const tx = Math.cos(t);
	const ty = Math.sin(t) + .5;
	const tz = 1;

	return new THREE.Vector3( tx, ty, tz );

};

const path = new EllipticCurve();
const smileGeom = new THREE.TubeGeometry( path, 64, .1, 3, false);
const smileMat = basicMaterials.black;
const smile = new THREE.Mesh( smileGeom, smileMat );
head.add( smile );

const bowCenterGeom = new THREE.SphereGeometry(.3, 8);
const bowCenter = new THREE.Mesh(bowCenterGeom, basicMaterials.red);
bowCenter.position.y += 1.3;
head.add(bowCenter);

const bowLeftGeom = new THREE.Geometry();
bowLeftGeom.vertices = [
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(-1, .5, .5),
  new THREE.Vector3(-1, -.5, .5),
  new THREE.Vector3(-1, .5, -.5),
  new THREE.Vector3(-1, -.5, -.5)
];
bowLeftGeom.faces = [ 
  new THREE.Face3(0, 1, 2),
  new THREE.Face3(0, 3, 4),
  new THREE.Face3(0, 1, 3),
  new THREE.Face3(0, 2, 4),
  new THREE.Face3(1, 2, 3),
  new THREE.Face3(1, 3, 4),
];
const bowLeft = new THREE.Mesh(bowLeftGeom, basicMaterials.red);
bowCenter.add(bowLeft)

const bowRightGeom = new THREE.Geometry();
bowRightGeom.vertices = [
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(1, .5, .5),
  new THREE.Vector3(1, -.5, .5),
  new THREE.Vector3(1, .5, -.5),
  new THREE.Vector3(1, -.5, -.5)
];
bowRightGeom.faces = [ 
  new THREE.Face3(0, 1, 2),
  new THREE.Face3(0, 3, 4),
  new THREE.Face3(0, 1, 3),
  new THREE.Face3(0, 2, 4),
  new THREE.Face3(1, 2, 3),
  new THREE.Face3(1, 3, 4),
];
const bowRight = new THREE.Mesh(bowRightGeom, basicMaterials.red);
bowCenter.add(bowRight)

const dressGeom = new THREE.ConeGeometry( 1, 2, 32 );
const dressMat = basicMaterials.pink;
const dress = new THREE.Mesh( dressGeom, dressMat );
const gyro = new THREE.Object3D();
gyro.position.y -= 1;
head.add(gyro);
scene.add(dress);

const monsterBody = new THREE.BoxGeometry(3, 2, 3);
const monsterBodyMat = basicMaterials.grey;
const monsterFaceMat = new THREE.MeshPhongMaterial({
  map: loader.load(monsterFace),
  transparent: false,
});
const monsterTongueMat = new THREE.MeshPhongMaterial({
  map: loader.load(monsterTongue),
  transparent: false,
});
const monsterMats = [
  monsterBodyMat,
  monsterBodyMat,
  monsterBodyMat,
  monsterBodyMat,
  monsterFaceMat,
  monsterBodyMat,
];
const monster = new THREE.Mesh(monsterBody, monsterMats);
monster.position.add(new THREE.Vector3(2, 1, -10));
monster.rotation.setFromVector3(new THREE.Vector3(.3, -.2, 0));
scene.add(monster);

// for use in calculating intersection
const monsterBB = new THREE.Box3();
let monsterHealth = 50;

let fontGeom;
let fontMat = basicMaterials.pink;
let font;

let loadedFont = new THREE.Font(winFont);
fontGeom = new THREE.TextGeometry( 'Kelsi Defeated The Printer!!!', {
  font: loadedFont,
  size: .5,
  height: .3,
} );
font = new THREE.Mesh(fontGeom, fontMat);
font.position.set(-10, 7, -5);

const shrapnel = [];
for (let i = 0; i < 100; i += 1) {
  const w = Math.random();
  const shrapnelGeom = new THREE.CubeGeometry(w, w, w);
  const materialTypes = Object.keys(basicMaterials);
  const materialType = materialTypes[Math.floor(Math.random() * materialTypes.length)];
  const shrapnelMat = basicMaterials[materialType]
  const shrapnelChunk = new THREE.Mesh(shrapnelGeom, shrapnelMat);
  shrapnel.push(shrapnelChunk);
}

//*********** Start game logic************//
let gameover = false;

window.addEventListener('mousemove', e => {
  const { clientX, clientY } = e;
  const { innerHeight, innerWidth } = window;
  
  mouse.x = clientX/innerWidth * 2 - 1;
  mouse.y = -clientY/innerHeight * 2 + 1;
  mouse.z = -1 -.2*mouse.x + .1*mouse.y;
});

let overRideMaterial = false;
const flashRed = (object) => {
  overRideMaterial = true;
  object.material = basicMaterials.red;

  setTimeout(() => {
    overRideMaterial = false;
  }, 300);
}

const fire = (projectile, vector) => {
  const projectileBB = new THREE.Box3();
  
  const checkForCollision = () => {
    if (gameover) return false;

    projectileBB.setFromObject(projectile);
    monsterBB.setFromObject(monster);

    const collision = monsterBB.intersectsBox(projectileBB);

    if (collision) {
      flashRed(monster);
      monsterHealth -= .3;
      scene.remove(projectile);
      return true;
    }

    return false;
  };

  let t = 0;
  let d = .1;
  const move = () => {
    if (t > 10) {
      scene.remove(projectile);
      return;
    }
    requestAnimationFrame(move);
    
    projectile.translateX(vector.x * d);
    projectile.translateY(vector.y * d);
    projectile.translateZ(vector.z * d);

    const collision = checkForCollision();
    if (collision) return;

    t += .1;
  }

  move();

};

const spawnProjectile = () => {
  const projectile = new THREE.Mesh(bowCenterGeom, basicMaterials.white);
  const { x, y, z } = head.position;
  
  projectile.position.set(x, y, z);
  scene.add(projectile);
  return projectile;
}

window.addEventListener('click', e => {
  const worldMousePosition = mouse.clone().multiplyScalar(5);
  const projectile = spawnProjectile();

  const direction = worldMousePosition.sub(projectile.position);
  fire(projectile, direction);
});

const directions = {
  "left": new THREE.Vector3(-1, 0, 0),
  "right": new THREE.Vector3(1, 0, 0),
  "up": new THREE.Vector3(0, 1, 0),
  "down": new THREE.Vector3(0, -1, 0),
};

const moveCharacter = (direction) => {

  let t = 0;
  let d = .05;
  const move = () => {
    if (t > 10) return;

    requestAnimationFrame(move);
    
    head.position.addScaledVector(direction, d);

    t += .5;
  }

  move();
}

window.addEventListener('keypress', e => {
  switch (e.key) {
    case "w":
      moveCharacter(directions.up);
      break;
    case "s":
      moveCharacter(directions.down);
      break;
    case "a":
      moveCharacter(directions.left);
      break;
    case "d":
      moveCharacter(directions.right);
      break;
  }
});

const randomVector = () => {
  const x = 1 - (2 * Math.random());
  const y = 1 - (2 * Math.random());
  const z = 1 - (2 * Math.random());

  return new THREE.Vector3(x, y, z).normalize();
}

let exploded = false;
const explode = () => {
  exploded = true;
  
  for (let i = 0; i < shrapnel.length; i += 1) {
    scene.add(shrapnel[i]);
  }

  let t = 0;
  let a = .3;
  const move = (chunk, vector) => {
    if (t > 100000) return;

    requestAnimationFrame(() => move(chunk, vector));

    chunk.position.addScaledVector(vector, a);

    t += .1;
  };

  for (let i = 0; i < shrapnel.length; i += 1) {
    const vec = randomVector();
    move(shrapnel[i], vec);
  }
};

light.position.z += 10
light.lookAt(bowCenter)

scene.add(light)

let t = 0;
const animate = function () {
  requestAnimationFrame( animate );

  raycaster.setFromCamera( mouse.clone(), camera );   
  const objects = raycaster.intersectObjects(scene.children);
  
  const worldMousePosition = mouse.clone().multiplyScalar(5);
  const worldHeadPostition = head.position.clone();

  head.lookAt(worldMousePosition);
  dress.position.setFromMatrixPosition(gyro.matrixWorld);

  t += .01;
  monster.rotation.y = -Math.abs(Math.cos(t));

  const monsterTongueMats = [
    monsterBodyMat,
    monsterBodyMat,
    monsterBodyMat,
    monsterBodyMat,
    monsterTongueMat,
    monsterBodyMat,
  ];

  if (!overRideMaterial) {
    if (monster.rotation.y + .5 > 0) {
      monster.material = monsterTongueMats;
    } else {
      monster.material = monsterMats;
    }
  }
  if (monsterHealth <= 0 && !gameover) {
    if (!exploded) {
      explode();
    }
    
    scene.remove(monster);

    scene.add(font);
    font.rotation.y = -Math.abs(Math.cos(t*.3));
    if (Math.abs(font.rotation.y) < .01) {
      gameover = true;
    }
  }
  renderer.render(scene, camera);
};

animate();