# dom-controller

Attach behavior to any element in a clear and debuggable way.

**Less than 2KB minified + zipped**

## Example Usage
```html
<!-- index.html -->
<head>
    <!-- include the library -->
    <script src="https://unpkg.com/dom-controller@0.4.2/bundle.min.js" defer></script>

    <!-- reference the controller -->
    <link controller-name="fancy" href="/controllers/to-do/fancy.mjs" />
</head>
<body>
    <!-- controller will attach to this ul -->	
    <ul controller="fancy">
        <li>Caviar</li>
        <li>Champagne</li>
    </ul>
</body>
```

```js
// controllers/to-do/fancy.mjs
export default class FancyController {

    // called when [controller="fancy"] is set
    async attach(element) { 
        add_save_events(element);
        load_items(element);
    }

    // called when [controller] is changed or removed
    async detach(element) {
        cancel_load_items(element);
        remove_save_events(element);
    }

}
```

You can also use TypeScript.
```typescript
// controllers/to-do/fancy.ts
import { IController } from 'dom-controller/IController';

export default class FancyController implements IController<HTMLElement> {
    element!: HTMLElement;
    async attach(element: HTMLElement): Promise<void> { }
    async detach(element: HTMLElement): Promise<void> { }
}
```

### Lifecycle calls
`attach()` is called when a controller is attached to an element. i.e. When the `controller` attribute is set to the name of a controller.

`detach()` is called when a controller is detached. This happens when an element is removed or when the `controller` attribute is changed to something new.

### Load as module
Sometimes you need a `.js` to act like `.mjs`. To do this add `type-is="module"`

example:
```html
<link
    type-is="module"
    controller-name="fancy"
    href="/controllers/to-do/fancy.js"
/>
```

### Using preload
Preload will tell your browser to load the scripts in advance. This is especially useful if you add immutable headers & a cache busting parameter.

```html
<link
    type-is="module"
    controller-name="fancy"
    href="/controllers/to-do/fancy.js"
    rel="preload" as="script"
    crossOrigin="anonymous"
/>
```

### Old-school loading, in order
```html
<!-- index.html -->
<head>
    <!-- include the library -->
    <script src="https://unpkg.com/dom-controller@0.4.2/bundle.min.js" defer></script>

    <!-- reference the controller -->
    <!-- it must come after loading dom-controller.js -->
    <script src="/controllers/to-do/fancy.js" defer></script>
</head>
<body>
    <!-- controller will attach to this ul -->	
    <ul controller="fancy">
        <li>Caviar</li>
        <li>Champagne</li>
    </ul>
</body>
```

```js
// controllers/to-do/fancy.js
class FancyController {
    async attach(element) { }
    async detach(element) { }
}

DomController.registerController(FancyController, 'fancy');
```

```typescript
// controllers/to-do/fancy.ts
import { IController } from 'dom-controller/IController';

class FancyController implements IController<HTMLElement> {
    element!: HTMLElement;
    async attach(element: HTMLElement): Promise<void> { }
    async detach(element: HTMLElement): Promise<void> { }
}

// @ts-ignore
DomController.registerController(FancyController, 'fancy');
```

### Script Placement
If you are using modules, i.e. `*.mjs`/`import`/`export default`, and loading using a `link` controller alias, then the `dom-controller.js` script can be loaded anytime anywhere.

If you aren't using modules, or you're using the `window.DomController.registerController()` call then the library needs to be loaded before any controller. You can speed up loading by using the defer attribute `<script defer ...>`.

### Decoupling
Here's how you can efficiently reuse a controller for multiple related elements. Elements keep internal state and produce events, controllers talk to the server and update element data. 
```typescript
// interfaces/todo-element.ts
export interface TodoElement extends HTMLUListElement {
    add(item: Item): void;
    remove(id: string): void;
}
```

```typescript
// elements/basic-todo.ts
import { TodoElement } from 'interfaces/todo-element.ts';

class BasicTodo implements TodoElement extends HTMLUListElement {
    constructor() {...}
    add(item: Item): void { }
    remove(id: string): void { }
}

window.customElements.define('basic-todo', BasicTodo);
```
```typescript
// elements/premium-todo.ts
import { TodoElement } from 'interfaces/todo-element.ts';

class PremiumTodo implements TodoElement extends HTMLUListElement {
    constructor() {...}
    add(item: Item): void { }
    remove(id: string): void { }
}

window.customElements.define('premium-todo', PremiumTodo);
```

```typescript
// controllers/todo.ts
import { IController } from 'dom-controller/IController';
import { TodoElement } from 'interfaces/todo-element.ts';

export default class TodoController implements IController<TodoElement> {
    element!: TodoElement;
    async attach(element: TodoElement): Promise<void> {
        element.add({ id: 1, text: 'Tada 🎉' })
    }
    async detach(element: TodoElement): Promise<void> { }
}

```
```html
<!-- index.html -->
<head>
    <!-- include the library -->
    <script src="https://unpkg.com/dom-controller@0.4.2/bundle.min.js" defer></script>

    <!-- reference the controller -->
    <link
        type-is="module"
        controller-name="todo"
        href="/controllers/todo.js"
    />
</head>
<body>
    <basic-todo controller="todo">
        <li>Cheez Wiz</li>
        <li>Grape Soda</li>
    </basic-todo>

    <premium-todo controller="todo">
        <li>Caviar</li>
        <li>Champagne</li>
    </premium-todo>
</body>
```
#### Pros:
* Helps track breaking changes.
* Intellisense works well.
* Interfaces don't add to transpiled size, they are "free".
* Code reuse / DRY.
#### Cons:
* Increased complexity, don't use unless you need it.
