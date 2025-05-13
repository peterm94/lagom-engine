# lagom-engine

> Lagom Game Engine

[![NPM](https://img.shields.io/npm/v/lagom-engine.svg)](https://www.npmjs.com/package/lagom-engine)

# Lagom

Lagom is a game framework for Typescript games.

# Basic Usage

## Available ECS Interfaces

### Component

Data container class. `Components` generally should not contain any logic. Use them to store data which can be
manipulated or read by `Systems` or `GlobalSystems`.

### Entity

Container type for `Components`. Generally should not contain any logic, as they do not have an `update` method.
The Entity class allows you to add `Components` and retrieve them by type.

### System

`Systems` update every game tick on specific `Component` groupings. A system must declare which `Component`
combinations it wishes to run on. If an `Entity` is found which holds an instance of each requested `Component`,
the system will run on it. If any `Component` types are missing from the `Entity`, the `System` will not run.
If multiple matching Components of the same type are found on an `Entity`, the first found will be returned.

You can create a system in one of 2 ways. Either as a class, or as a function. To define a system as a function and
add it to a scene:

```ts
    scene.addFnSystem([CompA, CompB], (delta, entity, compA, compB) => {
    // logic here

    // or just make one and add it later.
    const a = newSystem([A], (delta, entity, a) => {
        a.destroy();
    })

    this.addFnSystem(a);
});
```

The first parameter is an array of component types to match. The second is a function with the delta since the last
frame in milliseconds, the owning entity, and each component instance as defined in order based on the first parameter.

To create a System as a class:

```ts
class Booster extends System<[Boost]> {
    update(delta: number): void {
        this.runOnEntities((entity, booster) => {
            ThingMover.velocity += 0.005 * component.mod;
            component.destroy();
        })
    }

    // You need to provide the types again for.
    types: [CType<Boost>] = [Boost];

}
```

The type parameter should be a list of components. Unlike the functional approach, this method has a method for you to
implement, which gives you the entity and component instances and is run every frame.

You also need to provide the generic types again in the `types` variable.

### GlobalSystem

`GlobalSystems` are similar to `Systems`, but instead of running on `Component` groupings by entities, they run on all
`Components` of specified types.

These can only be defined as classes:

```ts

export class ScreenShaker extends GlobalSystem<[ScreenShake[]]> {

    types = [ScreenShake];

    update(delta: number): void {
        this.runOnComponents((shakers: ScreenShake[]) => {
            for (const shaker of shakers) {
                // logic
            }
        });
    }
}
```

The type parameter should be a list of component lists. As above, the types variable must be set and the update method
called with runOnComponents.

### Scene

A `Scene` is a container object for all of the ECS object types. A `Scene` can be likened to a game level.

### Game

The `Game` type is the top level Lagom object type. All global configuration is done in the `Game` instance and it
controls the update loop and the currently loaded `Scene`.

## Modules

### Audio

The `AudioAtlas` class allows you to load and manage audio files using the [Howler](https://howlerjs.com/) engine.

Audio files can be loaded using the `load` method.

Example:

```typescript
AudioAtlas.load("jump", require("./resources/jump.wav"))
```

A file can then be simply played with the `AudioAtlas.play()` method, or `Howler` methods can be used directly for more
advanced usage.

### Sprite

#### Sprite

Simple `Sprite` component used to render images. A `Sprite` can be directly created from a `PIXI Texture`.

#### SpriteSheet

A `SpriteSheet` can be used to load multiple sprites at once that are part of a larger image. This supports single and
multiple texture extraction with tile indexing support.

#### AnimatedSprite

A `Sprite` component type that supports multiple image frames and animation options.

#### AnimatedSpriteController

A more advanced version of `AnimatedSprite`, that allows for multiple animation states that can be controlled with
logic.
Also supports custom event triggering on registered animation frames.

### Camera

A Lagom `Scene` always has a single `Camera`, which can be accessed via the `camera` property. This controls how the
game viewport is rendered.
The `Camera` can be moved directly, or used with the `FollowCamera` to follow an `Entity` in a game `Scene`.

### PIXI Components

Commonly used rendering `Components`, to display shapes and text.

- TextDisp
- RenderCircle
- RenderRect
- RenderPoly

### ScreenShake

Screenshake `System` and `Component`. The `ScreenShaker` `WorldSystem` must be added to a `Scene` for it to work. Create
a `ScreenShake` instance on an `Entity` to trigger it.

### TiledMapLoader

Custom loader for [Tiled](https://www.mapeditor.org/) exported maps. This class can only open map exported with the JSON
type.

### Timer

Timer used to schedule events, controlled by the ECS. All subscribed Observers to the `onTrigger` event will be notified
when the timer is complete.
A `TimerSystem` must be added to a `Scene` for the timer to function.

### Debugging and Utilities

A `Diagnostics` `Entity` has been provided that will display useful information about the FPS on the canvas.

The `Util` and `MathUtil` classes provide useful helper functions that are commonly used when dealing with objects in a
2D space.

`Log` is a custom logger with multiple logging levels that can be enabled or disabled with the `Log.logLevel` property.

### Physics and Collision Detection

Collision detection is implemented using the Detect library. There are a few different implementations you can use
depending on your use case.

It makes use of the `CollisionMatrix` class, which allows layers and collision rules to be created.
By default, no layers can collide at all.

#### Detect

The two implementations are `ContinuousCollisionSystem` and `DiscreteCollisionSystem`. See the class docs for details.

To use this system, an instance must be added to the active `Scene`.

In order to register for collisions, `Entities` must add one of the various `Collider` `Components` (
`CircleCollider`, `PointCollider`, `RectCollider`, `PolyCollider`).

The `Collider` type has multiple `Observable` members that are triggered for different types of collision events.
These can be subscribed to by any `Observer`.

- `onCollision`/`onTrigger`: Triggered on any collision frame. For continuous collisions, this will be triggered on
  every single frame.
- `onCollisionEnter`/`onTriggerEnter`: Triggered on the first collision frame.
- `onCollisionExit`/`onTriggerExit`: Triggered one frame after the last collision frame.

Depending on the Detect System that you are using, you may want to avoid moving the entity directly via the transform.
`DiscreteCollisionSystem` allows for normal movement via the transform, `ContinuousCollisionSystem` bodies should only
be moved via Rigidbody updates.

### Game Setup

To make a new game, make a class that extends `Game`. In the constructor, set up the view canvas, and ensure a `Scene`
is set.

```ts
export class Pong extends Game {
    constructor() {
        super({width: 800, height: 600, resolution: 1, backgroundColor: 0x000000});
        this.setScene(new MainScene(this));
    }
}
```

Then, just instantiate the game and append the game's renderer to your web page.

```ts
const main = document.querySelector<HTMLDivElement>('#main');
const game = new Pong();

main.appendChild(game.renderer.view);

// Focus the canvas for keyboard events
game.renderer.view.focus();

// Trigger game start.
game.start();
```

### Resource Loading

To ensure image resources are loaded before use, you can make use of the resource loader on the `Game` class. All resources
will be loaded before the game loop starts.

```ts
// Game constructor excerpt:

export class MyGame extends Game {
  constructor() {
      super({
          width: VIEW_WIDTH,
          height: GAME_HEIGHT,
          resolution: 2,
          backgroundColor: 0x0B0926
      });

      this.addResource("mute_button", new SpriteSheet(muteButtonSpr, 16, 16));
      this.addResource("tile", new SpriteSheet(tileSpr, 12, 12));
  }
}
```
Then to use it later:
```ts
new Sprite(this.scene.game.getResource("tile").textureFromIndex(0));
```


## License

MIT © [Peter Mandile](https://github.com/peterm94)
