import {WebXRButton} from '../ar.tarot.scripts/js.module/util/webxr-button.js';
import {Scene} from '../ar.tarot.scripts/js.module/render/scenes/scene.js';
import {Renderer, createWebGLContext} from '../ar.tarot.scripts/js.module/render/core/renderer.js';
import {Node} from '../ar.tarot.scripts/js.module/render/core/node.js';
import {Gltf2Node} from '../ar.tarot.scripts/js.module/render/nodes/gltf2.js';
import {DropShadowNode} from '../ar.tarot.scripts/js.module/render/nodes/drop-shadow.js';
import {vec3} from '../ar.tarot.scripts/js.module/render/math/gl-matrix.js';
import {Ray} from '../ar.tarot.scripts/js.module/render/math/ray.js';
// XR globals.
      let xrButton = null;
      let xrRefSpace = null;
      let xrViewerSpace = null;
      let xrHitTestSource = null;

// WebGL scene globals.
      let gl = null;
      let renderer = null;
      let scene = new Scene();
      scene.enableStats(false);

      let arObject = new Node();
      arObject.visible = false;
      scene.addNode(arObject);

      let taroCard = new Gltf2Node({url: '../ar.tarot.resourses/gltf.tarot.models/card_imp/Сard.gltf'});
      arObject.addNode(taroCard);

      let reticle = new Gltf2Node({url: '../ar.tarot.resourses/gltf.tarot.models/reticle/reticle.gltf'});
      reticle.visible = false;
      scene.addNode(reticle);

// Having a really simple drop shadow underneath an object helps ground
// it in the world without adding much complexity.
      let shadow = new DropShadowNode();
      vec3.set(shadow.scale, 0.15, 0.15, 0.15);
      arObject.addNode(shadow);
      setTimeout(alert('ok',2000));

      scene.clear = false;

      function initXR() {
        xrButton = new WebXRButton({
          onRequestSession: onRequestSession,
          onEndSession: onEndSession,
          textEnterXRTitle: "Throw Cards",
          textXRNotFoundTitle: "AR Spirits not found ",
          textExitXRTitle: "Collect a Deck",
          cssprefix: "display: block; margin-left: auto; margin-right: auto;"
        });
        document.querySelector('header').appendChild(xrButton.domElement);

        if (navigator.xr) {
          navigator.xr.isSessionSupported('immersive-ar')
                      .then((supported) => {
            xrButton.enabled = supported;
          });
        }
      }

      function onRequestSession() {
        return navigator.xr.requestSession('immersive-ar', {requiredFeatures: ['local', 'hit-test']})
                           .then((session) => {
          xrButton.setSession(session);
          onSessionStarted(session);
        });
      }

      function onSessionStarted(session) {
        session.addEventListener('end', onSessionEnded);
        session.addEventListener('select', onSelect);

        if (!gl) {
          gl = createWebGLContext({
            xrCompatible: true
          });

          renderer = new Renderer(gl);

          scene.setRenderer(renderer);
        }

        session.updateRenderState({ baseLayer: new XRWebGLLayer(session, gl) });

// In this sample we want to cast a ray straight out from the viewer's
// position and render a reticle where it intersects with a real world
// surface. To do this we first get the viewer space, then create a
// hitTestSource that tracks it.
        session.requestReferenceSpace('viewer').then((refSpace) => {
          xrViewerSpace = refSpace;
          session.requestHitTestSource({ space: xrViewerSpace }).then((hitTestSource) => {
            xrHitTestSource = hitTestSource;
          });
        });

        session.requestReferenceSpace('local').then((refSpace) => {
          xrRefSpace = refSpace;

          session.requestAnimationFrame(onXRFrame);
        });
      }

      function onEndSession(session) {
        xrHitTestSource.cancel();
        xrHitTestSource = null;
        session.end();
      }

      function onSessionEnded(event) {
        xrButton.setSession(null);
      }

// Adds a new object to the scene at the
// specificed transform.
      function addARObjectAt(matrix) {
        let newTaro = arObject.clone();
        newTaro.visible = true;
        newTaro.matrix = matrix;
        //setTimeOut(newTaro.rotation = new Float32Array([0, 90, 0, 1]),5000);
        scene.addNode(newTaro);
      }
      let rayOrigin = vec3.create();
      let rayDirection = vec3.create();

      function onSelect(event) {
        if (reticle.visible) {
          addARObjectAt(reticle.matrix);
        }
      }

// Called every time a XRSession requests that a new frame be drawn.
      function onXRFrame(t, frame) {
        let session = frame.session;
        let pose = frame.getViewerPose(xrRefSpace);

        reticle.visible = false;

// If we have a hit test source, get its results for the frame
// and use the pose to display a reticle in the scene.
        if (xrHitTestSource && pose) {
          let hitTestResults = frame.getHitTestResults(xrHitTestSource);
          if (hitTestResults.length > 0) {
            let pose = hitTestResults[0].getPose(xrRefSpace);
            reticle.visible = true;
            reticle.matrix = pose.transform.matrix;
          }
        }

        scene.startFrame();

        session.requestAnimationFrame(onXRFrame);

        scene.drawXRFrame(frame, pose);

        scene.endFrame();
      }

      initXR();