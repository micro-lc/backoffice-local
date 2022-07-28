# Create your first custom component

## Checkout the example provided

While spawning `custom-lib`, a custom component was created within `src/web-components/example` and
serves as a very rudimental explaination on how you could test a component while development undergoes.

Move to the main directory of your custom library and create an `index.html` file with the following content:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <script type="module" src="/src/index.ts"></script>
</head>
<body>
  <bk-webc-example></bk-webc-example>
</body>
</html>
```

and run

```shell
yarn vite
```

then browse to http://localhost:3000.
By inspecting the document, a custom tag has been inserted and
a [shadow root](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot) was injected
to isolate the inner part of the component.

Let's take a look at the code

```typescript
// src/web-components/example/webc-example.ts
/**
 * 👈 imports are here
 */

@customElement('bk-webc-example')
export class BkExample extends LitElement {
  @property({attribute: false}) content: LocalizedText = {en: 'Example', it: 'Esempio'}

  protected render (): TemplateResult {
    const localizedContent = getText.call(this)
    return html`<div>
      <span>
        ${localizedContent}
      </span>
    </div>`
  }
}
```

The component is just created using [lit](https://lit.dev) features and lifecycles
currently unmodified from lit's default behaviour.
Briefly, `properties` and `attributes` are mapped using the [`property` decorator](https://lit.dev/docs/components/properties/) and a custom tag
is declared by the [`customElement`](https://lit.dev/docs/components/defining/) decorator.

The render function interprets a templated pseudo-html to be rendered on the DOM.
The `html` template parser:

1. sanitizes malicious `script` tags and/or `link` tags
2. distinguishes between attributes and properties using a [dotted notation](https://lit.dev/docs/templates/overview/)

You could just play around with this component and transfer the business logic of the `getText` function on a
private state:

```typescript
// src/web-components/example/webc-example.ts
/**
 * 👈 imports are here
 */
import {getLocalizedText} from '@micro-lc/back-kit-engine/utils'

@customElement('bk-webc-example')
export class BkExample extends LitElement {
  @state() localizedContent?: string
  @property()
  set content(t: LocalizedText) {
    this.localizedContent = getLocalizedText(t)
  }

  protected render (): TemplateResult {
    return html`<div>
      <span>
        ${this.localizedContent}
      </span>
    </div>`
  }
}
```

If everything went well, the component should have disappeared, since we are asking to render
and `undefined` instead of a `string`: `content` is not set.

We removed `attribute: false` from the property and hence we could use some native html to fix it:

```html
<!-- index.html -->
<body>
  <bk-webc-example content="Ciao!"></bk-webc-example>
</body>
```

and now the component should render a `Ciao!` string.
The content had a `set` function which modified an internal state. Both
triggered a rerender which was condensed into a single rerender by `lit`
and the template reflected the state change showing `Ciao!`.

We won't go into any further detail on `lit` lifecycles and we simply refer to the
documentation.

## New component

Let's run

```shell
yarn new-cmp custom-button
```

where `custom-button` can be any name you'd like to give to your new component.
This should spawn the following folder tree:

<pre>
<strong>src</strong>
|   index.ts
└───<strong>react-components</strong>
└───<strong>web-components</strong>
    |   index.ts
    └───<strong>custom-button</strong>
        |   custom-button.ts
        |   custom-button.lib.ts
        |   index.ts
        └───<strong>__tests__</strong>
               custom-button.test.ts
</pre>

First of all ensure that `src/web-components/custom-button` is exported by the
`src/web-components/index.ts` by adding

```typescript
// src/web-components/index.ts

export * from './custom-button'
```

and let's add it to the `index.html` for rendering

```html
<!-- index.html -->
<body>
  <bk-webc-example content="Ciao!"></bk-webc-example>
  <custom-button></custom-button>
</body>
```

A button should have entered the DOM with a caption `Click me!` and some
text `Listening...`.

By clicking **nothing** should happen. Let's take a look at the code

```typescript
@customElement('custom-button')
export class CustomButton extends BkBase {
  @state() message?: string
  @property() loadingMessage = 'Loading...'
  @property() listeningMessage = 'Listening...'

  loading = false
  onClick = emitLoading.bind(this)

  constructor () {
    super(
      listensToLoadingData
    )
  }

  protected render (): TemplateResult {
    return html`<div>
      <button
        .onclick=${this.onClick}
      >
        ${'Click me!'}
      </button>
      <span>
        ${this.message ?? this.listeningMessage}
      </span>
    </div>`
  }
}
```

### Extending **@micro-lc/back-kit-engine** classes

The first feature to notice is the `extension` from a different
base class. `BkBase` is a [subclass](https://github.com/micro-lc/back-kit-engine/tree/main/base#back-kit-enginebase) of `LitElement` which implements the
business of pub/subbing to a communication channel.

The [constructor](https://github.com/micro-lc/back-kit-engine/tree/main/base#bkbase) wants to know whether we'd like to register some listeners,
either one or an array, to filter the pub/sub channel looking for event-driver
dom actions that we might respond to.

The pub/sub channel is an `rxjs`'s `ReplaySubject` class under the property named `eventBus` which is
`public`.

The listener is passed to to the constructor and the `BkBase` implementation binds it when
useful to the channel. Let's checkout `listensToLoadingData` whose code is contained in a `.lib.ts`
file to divide business logic from component/dom-rendering logic.

```typescript
export function listensToLoadingData (
  this: CustomButton,
  eventBus: EventBus,
  kickOff: Observable<0>
): Subscription {
  return eventBus
    .pipe(
      skipUntil(kickOff),
      filter<Event, Event<LoadingDataPayload>>(loadingData.is)
    )
    .subscribe((event) => {
      /**
       * Some logic based on 
       * 1. event
       * 2. this <- current component
       */
    })
}
```

the pub/sub channel, named `eventBus` is passed when defined (hold on this...) and thus its
events stream is [modified](https://github.com/micro-lc/back-kit-engine/tree/main/base#element-composer-interface)

1. skips anything that happened before the emission of a kickoff (which emits on `connectedCallback` lifecycle step)
2. filters by keeping any `loadingData` event. `loadingData` is a [factory](https://github.com/micro-lc/back-kit-engine#event-factory) function which provides a `is` predicate check.
3. The business logic kicks in a Subscription which is set into memory and cleaned when the component is disconnected to avoid memory leaks.

Let's focus on the subscription callback

```typescript
({payload: {loading}}) => {
  this.loading = loading
  this.message = loading ?
    this.loadingMessage :
    this.listeningMessage
}
```

which is a side-effect on the web-component that sets `loading` and `message`. `message` also
is marked `@state()` which triggers a re-render to show the new DOM where the `span` should
print `this.message` instead of `this.loadingMessage`.

Let's look at the emitter

```typescript
export function emitLoading (this: CustomButton): void {
  this.eventBus?.next(loadingData({loading: !this.loading}))
}
```

which is triggered on button's click. It writes in the pub/sub channel a `loadingData` event. So,
by clicking, we realize a cyclic operation (obviously not the recommended one but useful to
show the internal logic).

1. `onclick` -> loading to `false`
2. pub `loadingData`
3. sub `loadingData`
4. change `this.message`
5. re-render
6. `onclick` -> loading to `true`
7. back to 2

Nothing will ever change though unless we connect the component to a pub/sub channel. Hence
let's modify the `index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <script src="https://unpkg.com/rxjs@7.5.6/dist/bundles/rxjs.umd.min.js"></script>
  <script type="module" src="/src/index.ts"></script>
</head>
<body>
  <custom-button></custom-button>

  <script>
    const button = document.querySelector('custom-button')
    const eventBus = new rxjs.ReplaySubject()
    Object.assign(button, {eventBus})
    Object.defineProperty(window, '$', {value: eventBus})
  </script>
</body>
</html>
```

we introduce the `umd` version of the `rxjs` lib and we bind the `custom-button` to
the `eventBus`. To check it out we also write a `$` variable to the window. In the
context of a `backoffice` plugin this task is [performed](../10_overview.md#micro-lc-element-composer) by `micro-lc`'s `element-composer`
plugin.

Since we attached `eventBus` onto the window as `$` we can checkout the list of events
piped in the channel. On the browser console we could run

```javascript
$.subscribe(console.log)
```

and on each button click, the console would display the event published.
