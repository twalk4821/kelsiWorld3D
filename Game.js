const THREE = require('three');
const loader = new THREE.TextureLoader();
const fontLoader = new THREE.FontLoader();
const audioLoader = new THREE.AudioLoader();

const story1 = require('./story/story1.png');
const story2 = require('./story/story2.png');
const story3 = require('./story/story3.png');
const story4 = require('./story/story4.png');
const story5 = require('./story/story5.png');
const story6 = require('./story/story6.png');
const story7 = require('./story/story7.png');
const monsterFace = require('./Monster.png');
const monsterTongue = require('./Monster-2.png');
const track = require('./80s.ogg');
const blopTrack = require('./blop.ogg');
const explosionTrack = require('./explosion.ogg');
const winFont = require('./font.json');

const storyBook = {
  story1,
  story2,
  story3,
  story4,
  story5,
  story6,
  story7,
};

const directions = {
  "left": new THREE.Vector3(-1, 0, 0),
  "right": new THREE.Vector3(1, 0, 0),
  "up": new THREE.Vector3(0, 1, 0),
  "down": new THREE.Vector3(0, -1, 0),
};

const randomVector = () => {
  const x = 1 - (2 * Math.random());
  const y = 1 - (2 * Math.random());
  const z = 1 - (2 * Math.random());

  return new THREE.Vector3(x, y, z).normalize();
};
const basicMaterials = {
  yellow: new THREE.MeshBasicMaterial( { color: 0xffff00 } ),
  black: new THREE.MeshBasicMaterial( { color: 0x000000 } ),
  grey: new THREE.MeshBasicMaterial( { color: 0x222222 } ),
  white: new THREE.MeshBasicMaterial( { color: 0xffffff } ),
  red: new THREE.MeshBasicMaterial({ color: 0xff0000 }),
  pink: new THREE.MeshBasicMaterial({ color: 0xff69b4 }),
  skin: new THREE.MeshBasicMaterial({ color: 0xffad60 }),  
};
const storyMats = [
  basicMaterials.white,
  basicMaterials.white,
  basicMaterials.white,
  basicMaterials.white,
  new THREE.MeshPhongMaterial({
    map: loader.load(story1),
    transparent: false,
  }),
  basicMaterials.white,
];

const dressMat = basicMaterials.pink;

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
const monsterTongueMats = [
  monsterBodyMat,
  monsterBodyMat,
  monsterBodyMat,
  monsterBodyMat,
  monsterTongueMat,
  monsterBodyMat,
];

class Game {
  constructor() {
    const scene = new THREE.Scene();
    const light = new THREE.DirectionalLight();
    const raycaster = new THREE.Raycaster();
    const listener = new THREE.AudioListener();
    const mouse = new THREE.Vector3();
    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
    const renderer = new THREE.WebGLRenderer();

    camera.add(listener);
    renderer.setSize( window.innerWidth, window.innerHeight );

    const storyGeom = new THREE.CubeGeometry(4, 4, .1);
    const story = new THREE.Mesh(storyGeom, storyMats);
    story.position.y += 5;
    scene.add(story);
    this.story = story;
    
    const music = new THREE.Audio( listener );

    const explosion = new THREE.Audio( listener );
    audioLoader.load(explosionTrack, ( buffer ) => {
      explosion.setBuffer( buffer );
      explosion.setLoop( false );
      explosion.setVolume( 1 );
    });
    const blop = new THREE.Audio( listener );
    audioLoader.load(blopTrack, ( buffer ) => {
      blop.setBuffer( buffer );
      blop.setLoop( false );
      blop.setVolume( 1 );
    });

    this.audio = { music, explosion, blop };

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
      new THREE.Vector3(0, -1, 0),
      new THREE.Vector3(-1, -1, 0),
      new THREE.Vector3(-1, 0, 0),
      new THREE.Vector3(-.5, -.5, 1)
    ];
    bowLeftGeom.faces = [ 
      new THREE.Face3(0, 1, 2),
      new THREE.Face3(0, 2, 3),
      new THREE.Face3(1, 0, 4),
      new THREE.Face3(2, 1, 4),
      new THREE.Face3(3, 2, 4),
      new THREE.Face3(0, 3, 4),
    ];
    const bowLeft = new THREE.Mesh(bowLeftGeom, basicMaterials.red);
    bowLeft.position.x -= 1;
    bowLeft.position.y += .5;
    bowLeft.position.z -= .5;
    bowLeft.rotation.y += Math.PI/2
    bowCenter.add(bowLeft)

    const bowRightGeom = new THREE.Geometry();
    bowRightGeom.vertices = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(1, 1, 0),
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(.5, .5, 1)
    ];
    bowRightGeom.faces = [ 
      new THREE.Face3(0, 1, 2),
      new THREE.Face3(0, 2, 3),
      new THREE.Face3(1, 0, 4),
      new THREE.Face3(2, 1, 4),
      new THREE.Face3(3, 2, 4),
      new THREE.Face3(0, 3, 4),
    ];
    const bowRight = new THREE.Mesh(bowRightGeom, basicMaterials.red);
    bowRight.position.x += 1;
    bowRight.position.y -= .5;
    bowRight.position.z -= .5;
    bowRight.rotation.y -= Math.PI/2
    bowCenter.add(bowRight)

    const dressGeom = new THREE.ConeGeometry( 1, 2, 32 );
    const dress = new THREE.Mesh( dressGeom, dressMat );
    const gyro = new THREE.Object3D();
    gyro.position.y -= 1;
    head.add(gyro);
    scene.add(dress);

    this.head = head;
    this.dress = dress;
    this.gyro = gyro
    this.bowCenterGeom = bowCenterGeom;

    const monsterBody = new THREE.BoxGeometry(3, 2, 3);
    
    const monster = new THREE.Mesh(monsterBody, monsterMats);
    monster.position.add(new THREE.Vector3(2, 1, -10));
    monster.rotation.setFromVector3(new THREE.Vector3(.3, -.2, 0));
    this.monster = monster;

    // for use in calculating intersection
    this.monsterBB = new THREE.Box3();
    this.monsterHealth = 50;

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
    this.font = font;

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
    this.shrapnel = shrapnel;

    //*********** Start game logic************//
    //Procedural Properties
    this.gameStarted = false;
    this.gameover = false;
    this.pageNumber = 1;
    this.overRideMaterial = false;
    this.exploded = false;


    window.addEventListener('mousemove', e => {
      const { clientX, clientY } = e;
      const { innerHeight, innerWidth } = window;
      
      this.mouse.x = clientX/innerWidth * 2 - 1;
      this.mouse.y = -clientY/innerHeight * 2 + 1;
      this.mouse.z = -1 -.2*this.mouse.x + .1*this.mouse.y;
    });

    window.addEventListener('click', e => {
      if (!this.gameStarted) {
        this.turnPage();
      } else {
        // fire
        const worldMousePosition = this.mouse.clone().multiplyScalar(5);
        const projectile = this.spawnProjectile();
      
        const direction = worldMousePosition.sub(projectile.position);
        this.fire(projectile, direction);
      }
    });

    window.addEventListener('keypress', e => {
      if (!this.gameStarted) return;
      switch (e.key) {
        case "w":
          this.moveCharacter(directions.up);
          break;
        case "s":
          this.moveCharacter(directions.down);
          break;
        case "a":
          this.moveCharacter(directions.left);
          break;
        case "d":
          this.moveCharacter(directions.right);
          break;
      }
    });

    light.position.z += 10
    light.lookAt(bowCenter)

    scene.add(light)

    this.scene = scene;
    this.light = light;
    this.raycaster = raycaster;
    this.loader = loader;
    this.fontLoader = fontLoader;
    this.audioLoader = audioLoader;
    this.listener = listener;
    this.mouse = mouse;
    this.camera = camera;
    this.renderer = renderer;

  }

  turnPage() {
    if (this.pageNumber === 7) {
      this.scene.remove(this.story);
      this.scene.add(this.monster);
      this.gameStarted = true;
    } else {
      this.pageNumber += 1;
      const selectedPage = 'story' + this.pageNumber;
      const page = storyBook[selectedPage];
      this.story.material = [
        basicMaterials.white,
        basicMaterials.white,
        basicMaterials.white,
        basicMaterials.white,
        new THREE.MeshPhongMaterial({
          map: loader.load(page),
          transparent: false,
        }),
        basicMaterials.white,
      ];
    }
  }

  flashRed (object) {
    this.overRideMaterial = true;
    object.material = basicMaterials.red;

    setTimeout(() => {
      this.overRideMaterial = false;
    }, 300);
  }

  fire(projectile, vector) {
    const projectileBB = new THREE.Box3();
    
    const checkForCollision = () => {
      if (this.gameover) return false;

      projectileBB.setFromObject(projectile);
      this.monsterBB.setFromObject(this.monster);

      const collision = this.monsterBB.intersectsBox(projectileBB);

      if (collision) {
        this.flashRed(this.monster);
        this.monsterHealth -= .3;
        this.scene.remove(projectile);
        return true;
      }

      return false;
    };

    let t = 0;
    let d = .1;
    const move = () => {
      if (t > 10) {
        this.scene.remove(projectile);
        return;
      }
      requestAnimationFrame(move);
      
      projectile.translateX(vector.x * d);
      projectile.translateY(vector.y * d);
      projectile.translateZ(vector.z * d);

      const collision = checkForCollision();
      if (collision) return;

      t += .1;
    };

    move();
    this.audio.blop.play();
  }

  spawnProjectile() {
    const projectile = new THREE.Mesh(this.bowCenterGeom, basicMaterials.white);
    const { x, y, z } = this.head.position;
    
    projectile.position.set(x, y, z);
    this.scene.add(projectile);
    return projectile;
  }

  moveCharacter(direction) {
    let t = 0;
    let d = .05;
    const move = () => {
      if (t > 10) return;

      requestAnimationFrame(move);
      
      this.head.position.addScaledVector(direction, d);

      t += .5;
    }

    move();
  }

  explode() {
    this.exploded = true;
    
    for (let i = 0; i < this.shrapnel.length; i += 1) {
      this.scene.add(this.shrapnel[i]);
    }

    let t = 0;
    let a = .3;
    const move = (chunk, vector) => {
      if (t > 100000) return;

      requestAnimationFrame(() => move(chunk, vector));

      chunk.position.addScaledVector(vector, a);

      t += .1;
    };

    this.audio.explosion.play();
    for (let i = 0; i < this.shrapnel.length; i += 1) {
      const vec = randomVector();
      move(this.shrapnel[i], vec);
    }
    if (this.audio.music.isPlaying) {
      this.audio.music.stop();
    }
  };

  toggleMusic() {
    if (this.audio.music.isPlaying) {
      this.audio.music.stop();
    } else {
      this.audio.music.play();
    }
    console.log(this.audio.music)
  }

  mount(ele) {
    ele.appendChild(this.renderer.domElement);
  }

  play(withMusic = true) {
    let t = 0;
    const animate = () => {
      requestAnimationFrame( animate );
      
      const worldMousePosition = this.mouse.clone().multiplyScalar(5);
      const worldHeadPostition = this.head.position.clone();

      this.head.lookAt(worldMousePosition);
      this.dress.position.setFromMatrixPosition(this.gyro.matrixWorld);

      t += .01;
      this.monster.rotation.y = -Math.abs(Math.cos(t));

      if (!this.overRideMaterial) {
        if (this.monster.rotation.y + .5 > 0) {
          this.monster.material = monsterTongueMats;
        } else {
          this.monster.material = monsterMats;
        }
      }
      if (this.monsterHealth <= 0 && !this.gameover) {
        if (!this.exploded) {
          this.explode();
        }
        
        this.scene.remove(this.monster);

        this.scene.add(this.font);
        this.font.rotation.y = -Math.abs(Math.cos(t*.3));
        if (Math.abs(this.font.rotation.y) < .01) {
          this.gameover = true;
        }
      }
      this.renderer.render(this.scene, this.camera);
    };

    animate();
    if (withMusic) {
      audioLoader.load(track, ( buffer ) => {
        this.audio.music.setBuffer( buffer );
        this.audio.music.setLoop( true );
        this.audio.music.setVolume( 0.5 );
        this.audio.music.play();
      });
    }
  }
}

module.exports = Game;