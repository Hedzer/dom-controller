# dom-controller

## Example Usage
#### index.html
```html
<head>
    <!-- include the library -->
    <script src="https://unpkg.com/dom-controller@0.2.7/bundle.min.js"></script>
    <!-- reference the controller -->
    <link controller-name="sun-fish" href="sea/fish/sunfish.js" />
</head>
<body>
    <!-- controller will attach to this div -->	
    <div controller="sun-fish"></div>
</body>
```
#### /sea/fish/sunfish.js
```js
DomController.registerController(class SunFish {
    attach() {
        /* add your logic to an element */
        this.element.classList.add('fishy');
    }
    detach() {
        /* clean up on removal or controller change */
        this.element.classList.remove('fishy');
    }
});
```
In the above, the `/sea/fish/sunfish.js` controller is dynamically loaded in a `script` element. Once it's loaded, the `attach()` method is called and the `element` property is populated with the element instance. When the element is removed, `detach()` is called, and the `element` property is set to null.


## Controller In TypeScript
```typescript
import { IController } from 'dom-controller/IController';

class ToDo implements IController<HTMLElement> {
    element!: HTMLElement;
    async attach(): Promise<void> { }
    async detach(): Promise<void> { }
}

//@ts-ignore
window.DomController.registerController(ToDo);
```

The `IController` interface should be a zero cost abstraction that adds no weight to your build size.

## TypeScript + Import/Export
If you're building using a build target that outputs module syntax, using `import` or `export`, you must export the class as default.
If you don't you'll have to call `window.DomController.registerController` manually inside the file.
```typescript
// file: controllers/todo.mjs
import { IController } from 'dom-controller/IController';

export default class ToDo implements IController<HTMLElement> {
    element!: HTMLElement;
    async attach(): Promise<void> { }
    async detach(): Promise<void> { }
}
```

```html
<head>
    <!-- include the library -->
    <script src="https://unpkg.com/dom-controller@0.2.7/bundle.min.js"></script>
    <!-- reference the controller -->
    <link controller-name="to-do" href="controllers/todo.mjs" />
</head>
<body>
    <!-- controller will attach to this div -->	
    <div controller="to-do"></div>
</body>
```
`Dom-Controller` will flag the script as a module if the extension is `.mjs` or if `rel="modulepreload"`.
If you want to load the module as a module without the `.mjs` extension, you can use the `type-is` attribute do the following:
```html
<link type-is="module" controller-name="to-do" href="controllers/todo.js" />
```
The `type-is` attribute will override any automatic detection of how to load the file.

## Lifecycle Events
`controller.attached` is dispatched once a controller is attached.
`controller.detached` is dispatched when the controller is detached.

## Hardcoding Controller Names
```js
DomController.registerController(class SunFish {
    async attach() {
        /* add your logic to an element */
        this.element.classList.add('fishy');
    }
    async detach() {
        /* clean up on removal or controller change */
        this.element.classList.remove('fishy');
    }
}, 'my-hardcoded-name');
//  ^^^^ this will now be hardcoded
```
Now you can just import it as a script with zero indirection.
```html
<head>
    <!-- include the library -->
    <script src="https://unpkg.com/dom-controller@0.2.7/bundle.min.js"></script>
    <!-- reference the controller -->
	<script src="controllers/todo.js"></script>
</head>
<body>
    <!-- controller will attach to this div -->	
    <div controller="to-do"></div>
</body>
```


## Ideal Usage (Opinion)
#### index.html
```html
<head>
    <!-- include the library from a CDN -->
    <script src="https://unpkg.com/dom-controller@0.2.7/bundle.min.js"></script>
    <!-- preload as immutable, for an SPA feel -->
    <link rel="preload" as="script" controller-name="sun-fish" href="sea/fish/sunfish.js?v1.2.3" />
</head>
<body>
    <!-- controller will attach to this div -->	
    <div controller="sun-fish"></div>
</body>
```
#### /sea/fish/sunfish.js
```js
DomController.registerController(class SunFish {
    attach() {
        /* add your logic to an element */
        this.element.classList.add('fishy');
    }
    detach() {
        /* clean up on removal or controller change */
        this.element.classList.remove('fishy');
    }
});
```

### Run Tests
Run `npx http-server` at the project root, and in your browser navigate to `http://127.0.0.1:8080/spec/SpecRunner.html`. Adding more tests and higher quality tests is a "to do".