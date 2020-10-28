import * as React from 'react'
import styles from './styles.module.css'

interface Props
{
  text: string
}

export const ExampleComponent = ({ text }: Props) => {
  return <div className={styles.test}>Example Component: {text}</div>
}

export * from './Audio/AudioAtlas'

export * from './Common/Sprite/AnimatedSprite'
export * from './Common/Sprite/AnimatedSpriteController'
export * from './Common/Sprite/Sprite'
export * from './Common/Sprite/SpriteSheet'

export * from './Common/Camera';
export * from './Common/CameraUtil';
export * from './Common/Debug';
export * from './Common/FrameTrigger';
export * from './Common/Observer';
export * from './Common/PIXIComponents';
export * from './Common/Screenshake';
export * from './Common/TiledMapLoader';
export * from './Common/Timer';
export * from './Common/Util';
export * from './Common/Vector';

export * from './Collisions/Colliders'
export * from './Collisions/CollisionMatrix'
export * from './Collisions/CollisionSystems'
export * from './Collisions/Rigidbody'


export * from './ECS/Component'
export * from './ECS/Entity'
export * from './ECS/Game'
export * from './ECS/GlobalSystem'
export * from './ECS/LifecycleObject'
export * from './ECS/Scene'
export * from './ECS/System'

export * from './Input/Button'
export * from './Input/Key'
export * from './Input/Mouse'

export * from './Physics/SimplePhysics'

export * from './React/LagomGameComponent'


