import * as THREE from "three";
import * as dat from 'dat.gui';
import fragment from '../shaders/fragment.glsl'
import fragment1 from '../shaders/fragment1.glsl'
import vertex from '../shaders/vertex.glsl'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass";
import {ShaderPass} from "three/examples/jsm/postprocessing/ShaderPass";
import {PostProcessing} from "./postprocessing";

export default class Sketch {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.001, 1000 );
    this.camera.position.set(0,0,1.75);

    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.physicallyCorrectLights = true;
    // this.renderer.outputEncoding = THREE.sRGBEncoding;

    document.querySelector('.webgl').appendChild( this.renderer.domElement );
    this.controls = new OrbitControls( this.camera, this.renderer.domElement );

    this.texture = new THREE.TextureLoader().load('./img/02.jpg');
    this.texture.wrapS = this.texture.wrapT = THREE.MirroredRepeatWrapping;

    this.isPlaying = false;
    this.time = 0;
    this.mouse = 0;

    this.addMesh();
    this.mouseEvent();
    this.addPost();
    this.play();
    this.settings();
  }

  addMesh () {
    this.material = new THREE.ShaderMaterial( {
      side: THREE.DoubleSide,
      uniforms: {
        time: {type: 'f', value: 0},
        mouse: {type: 'f', value: 0},
        landscape: {type: 'f', value: this.texture},
        resolution:{type: 'v4', value: new THREE.Vector4()},
      },
      vertexShader: vertex,
      fragmentShader: fragment
    });

    this.material1 = new THREE.ShaderMaterial( {
      side: THREE.DoubleSide,
      uniforms: {
        time: {type: 'f', value: 0},
        mouse: {type: 'f', value: 0},
        landscape: {type: 'f', value: this.texture},
        resolution:{type: 'v4', value: new THREE.Vector4()},
      },
      vertexShader: vertex,
      fragmentShader: fragment1
    });

    this.geometry = new THREE.IcosahedronGeometry(1, 2);
    this.geometry1 = new THREE.IcosahedronBufferGeometry(1.001, 2);
    let length = this.geometry1.attributes.position.array.length;
    let bary = [];

    for (let i = 0; i < length/3; i++){
      bary.push(0,0,1,  0,1,0,  1,0,0)
    }

    let aBary = new Float32Array(bary);
    this.geometry1.setAttribute('aBary', new THREE.BufferAttribute(aBary,3))

    this.ico = new THREE.Mesh( this.geometry1, this.material );
    this.icoLines = new THREE.Mesh( this.geometry1, this.material1 );
    this.scene.add( this.ico );
    this.scene.add( this.icoLines );
  }

  mouseEvent () {
    this.lastX = 0;
    this.lastY = 0;
    this.speed = 0;

    document.addEventListener('mousemove', (e) => {
      this.speed += Math.sqrt((e.pageX - this.lastX)** 2 + (e.pageY - this.lastY)**2)*0.0007;
      this.lastX = e.pageX;
      this.lastY = e.pageY;
    });
  }

  addPost() {
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass( new RenderPass(this.scene, this.camera));
    this.customPass = new ShaderPass(PostProcessing);
    this.customPass.uniforms['resolution'].value = new THREE.Vector2(window.innerWidth, window.innerHeight);
    this.customPass.uniforms['resolution'].value.multiplyScalar(window.devicePixelRatio);
    this.composer.addPass(this.customPass)
  }

  settings() {

    this.settings = {
      howmuchrgbshifticanhaz: 1,
    };

    // this.gui = new dat.GUI();
    // this.gui.add(this.settings, 'howmuchrgbshifticanhaz', 0,1,0.01);
  }

  stop(){
    this.isPlaying = false;
  }

  play(){
    if(!this.isPlaying){
      this.isPlaying = true;
      this.render();
    }
  }

  render () {
    if(!this.isPlaying) return;
    this.time += 0.0008;
    this.mouse -= (this.mouse - this.speed)*0.05;
    this.speed *= 0.99;

    this.scene.rotation.x = this.time;
    this.scene.rotation.y = this.time;

    this.customPass.uniforms.time.value = this.time;
    this.customPass.uniforms.howmuchrgbshifticanhaz.value = this.mouse/5;

    this.material.uniforms.time.value = this.time;
    this.material.uniforms.mouse.value = this.mouse;
    this.material1.uniforms.time.value = this.time;
    this.material1.uniforms.mouse.value = this.mouse;

    this.composer.render();

    requestAnimationFrame(this.render.bind(this));
  };
}