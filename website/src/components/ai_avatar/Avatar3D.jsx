import { Suspense, Component, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, OrbitControls, Environment, Html } from '@react-three/drei';
import * as THREE from 'three';
import avatarModel from '@/assets/avatar.glb';
import animationsModel from '@/assets/animations.glb';

// Error Boundary Component
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error loading 3D model:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Failed to load 3D model.</div>;
    }
    return this.props.children;
  }
}

const facialExpressions = {
  default: {},
  smile: {
    browInnerUp: 0.17,
    eyeSquintLeft: 0.4,
    eyeSquintRight: 0.44,
    noseSneerLeft: 0.17,
    noseSneerRight: 0.14,
    mouthPressLeft: 0.61,
    mouthPressRight: 0.41,
  },
  sad: {
    mouthFrownLeft: 1,
    mouthFrownRight: 1,
    mouthShrugLower: 0.78,
    browInnerUp: 0.45,
    eyeSquintLeft: 0.72,
    eyeSquintRight: 0.75,
    eyeLookDownLeft: 0.5,
    eyeLookDownRight: 0.5,
    jawForward: 1,
  },
  angry: {
    browDownLeft: 1,
    browDownRight: 1,
    eyeSquintLeft: 1,
    eyeSquintRight: 1,
    jawForward: 1,
    jawLeft: 1,
    mouthShrugLower: 1,
    noseSneerLeft: 1,
    noseSneerRight: 0.42,
    eyeLookDownLeft: 0.16,
    eyeLookDownRight: 0.16,
    cheekSquintLeft: 1,
    cheekSquintRight: 1,
    mouthClose: 0.23,
    mouthFunnel: 0.63,
    mouthDimpleRight: 1,
  },
  surprised: {
    eyeWideLeft: 0.5,
    eyeWideRight: 0.5,
    jawOpen: 0.35,
    mouthFunnel: 1,
    browInnerUp: 1,
  },
};

function Model({ mouthOpen, facialExpression }) {
  const group = useRef();
  const { scene } = useGLTF(avatarModel);
  const { animations } = useGLTF(animationsModel);
  const { actions } = useAnimations(animations, group);

  const lerpMorphTarget = (target, value, speed = 0.1) => {
    scene.traverse((child) => {
      if (child.isSkinnedMesh && child.morphTargetDictionary) {
        const index = child.morphTargetDictionary[target];
        if (
          index === undefined ||
          !child.morphTargetInfluences ||
          child.morphTargetInfluences[index] === undefined
        ) {
          return;
        }
        child.morphTargetInfluences[index] = THREE.MathUtils.lerp(
          child.morphTargetInfluences[index],
          value,
          speed
        );
      }
    });
  };

  useFrame(() => {
    // Apply facial expression morph targets
    const expression = facialExpressions[facialExpression] || facialExpressions.default;
    for (const [key, value] of Object.entries(expression)) {
      lerpMorphTarget(key, value, 0.1);
    }

    // Reset morph targets that are not part of the current expression
    for (const key of Object.keys(scene.morphTargetDictionary || {})) {
      if (!expression[key]) {
        lerpMorphTarget(key, 0, 0.1);
      }
    }

    // Apply jawOpen morph target for lip-sync
    lerpMorphTarget("jawOpen", mouthOpen ? 1 : 0, 0.4);
  });

  useEffect(() => {
    if (actions && animations.length > 0) {
      const animationName = animations[0].name;
      actions[animationName].play();
    }
  }, [actions, animations]);

  return <primitive ref={group} object={scene} scale={1.5} position={[0, -1.5, 0]} />;
}

const Avatar3D = ({ mouthOpen, facialExpression }) => {
  return (
    <ErrorBoundary fallback={<div style={{ color: 'red', textAlign: 'center' }}>Avatar could not be loaded.</div>}>
      <Canvas
        style={{ width: '100%', height: '100%' }}
        camera={{ position: [0, 0, 3.5], fov: 45 }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <Suspense fallback={<Html center>Loading...</Html>}>
          <Model mouthOpen={mouthOpen} facialExpression={facialExpression} />
          <Environment preset="sunset" />
        </Suspense>
        <OrbitControls />
      </Canvas>
    </ErrorBoundary>
  );
};

export default Avatar3D;