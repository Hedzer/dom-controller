# dom-controller

## Example Usage
#### index.html
```html
<head>
    <!-- include the library -->
    <script src="dom-controller/bundle.js"></script>
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
import 'dom-controller/window';
import { IController } from 'dom-controller';

class ToDo implements IController<HTMLUListElement> {
    element!: HTMLUListElement;
    attach(): Promise<void> { }
    detach(): Promise<void> { }
}

window.DomController.registerController(ToDo);
```

Both the `IController` interface and `window` ambient should be zero cost abstractions that add no weight to your build size.

## Lifecycle Events
`controller.attached` is dispatched once a controller is attached.
`controller.detached` is dispatched when the controller is detached.

## Ideal Usage (Opinion)
#### index.html
```html
<head>
    <!-- include the library from a CDN -->
    <script src="https://unpkg.com/dom-controller"></script>
    <!-- preload as immutable, for an SPA feel -->
    <link
        rel="preload"  as="script"
        controller-name="sun-fish"
        href="sea/fish/sunfish.js?hash=A3EA..."
    />
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