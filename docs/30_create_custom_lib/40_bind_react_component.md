# Render using a React component

When the custom component needs a complex rendering logic,
maybe available throw a React components library. It might be useful
to keep the business logic into the webcomponent structure but render a
React Component.

Let's say we'd like to use a React design system like MUI or Antd, we might 
add some dependencies

with [mui](https://mui.com/):

```shell
yarn add @mui/material @emotion/react @emotion/styled
```

with [antd](https://ant.design/):

```shell
yarn add antd
```

let's add some files into `src/react-components`:

<pre>
<strong>src</strong>
|   index.ts
├───<strong>react-components</strong>
|   |   index.ts
|   └───<strong>CustomButton</strong>
|       |   CustomButton.tsx
|       |   index.ts
└───<strong>web-components</strong>
</pre>

and add a simple `Button` extension

mui:

```typescript
// src/react-components/CustomButton/CustomButton.tsx

import React from 'react'
import {Button, ButtonProps as MuiButtonProps} from '@mui/material'

export type ButtonProps = MuiButtonProps & {
  content?: string
}

export function CustomButton({content, ...props}: ButtonProps): JSX.Element {
  return <Button {...props}>{content}</Button>
}
```

antd:

```typescript
// src/react-components/CustomButton/CustomButton.tsx

import React from 'react'
import Button, {ButtonProps as AntdButtonProps} from 'antd/es/button'

export type ButtonProps = AntdButtonProps & {
  content?: string
}

export function CustomButton({content, ...props}: ButtonProps): JSX.Element {
  return <Button {...props}>{content}</Button>
}
```

and ensure it is exported

```typescript
// src/react-components/CustomButton/index.ts
// src/react-components/index.ts

export * from './CustomButton'
```

The webcomponent wrapper can be fully re-written as

```typescript
// src/web-components/custom-button/custom-button.ts
/**
 * 👈 imports go here
 */

@customElement('custom-button')
export class CustomButton extends BkComponent<ButtonProps> {
  @query('#container') container!: HTMLDivElement
  @state() loading = false

  constructor() {
    super(
      ReactCustomButton,
      createProps,
      listensToLoadingData
    )
  }

  protected render(): unknown {
    return html`<div id="container"></div>`
  }
}
```

with the following business logic:

```typescript
// src/web-components/custom-button/custom-button.lib.ts
/**
 * 👈 imports go here
 */

export function listensToLoadingData (this: CustomButton,  eventBus: EventBus, kickOff: Observable<0>): Subscription {
  return eventBus
    .pipe(
      skipUntil(kickOff),
      filter<Event, Event<LoadingDataPayload>>(loadingData.is)
    )
    .subscribe(({payload: {loading}}) => {
      this.loading = loading
    })
}

export function createProps(this: CustomButton): ButtonProps {
  return {content: 'Ciao', variant: 'contained', disabled: this.loading}
}
```

Notice that:

1. the web component renders a wrapper container
2. the same logic as before is contained within the `.lib.ts` file

On the first remark be mindful of the fact that React wants full control of the root
where `ReactDOM` renders. If you don't include the `container` the `BkComponent` renders
directly on the webcomponent shadow root which doesn't have a `parentElement` and this
fact undermines `React`. Hence be sure React has a proper `HTMLElement` as render root.

`lit` lifecycle is present all the time and manages React render right after its own
`updated` lifecycle (after the super call).

## Re-connection

To complete the webcomponent lifecycle we could consider to add a brief `console.log`
statement in the listener

```typescript
    // src/web-components/custom-button/custom-button.lib.ts

    .subscribe(({payload: {loading}}) => {
      console.log('here!')
      this.loading = loading
    })
```

Let's open the browser (after `yarn vite` on `localhost:3000`) and run the following snippet

```javascript
$.next({label: 'loading-data', payload: {loading: true}}) // 👉 should print 'here!'
```

then let's disconnect

```javascript
const el = document.querySelector('custom-button')
const {parentElement} = el

el.remove() // removes the element
parentElement.appendChild(el) // and re-attaches it
```

according to this [documentation](https://rxjs.dev/api/index/class/ReplaySubject), the
entire channel should be read again from the very beginning but using the statement

```javascript
skipUntil(kickoff)
```

in the reading pipeline, prevents the reading. Hence the button is still "loading"
but no 'here!' is printed, proving the lifecycle as descripted.

Obviously, this lifecycle is not always the needed feature. Sometimes it might be useful
to read the entire channel again or performing more complicated business logic. Anyway
any listener could be potentially aware of the connection status of the component is injected into.

## Styling

The webcomponent is in `shadowRoot` (open mode by default) hence no `css` is allowed from outside.
Indeed both `antd` and `mui` would append styles on the page `head` tag but none is rendered
within the shadow root. There are 2 possibilities here:

1. when you don't care about css scopization and redeclare the [rendering root](https://lit.dev/docs/components/shadow-dom/#implementing-createrenderroot) by setting

```typescript
class CustomButton ... {
  ...

  createRenderRoot() {
    return this
  }
}
```

2. shadowRoot JSS injection by using either `lit` utils or their wrapping inside `BkComponent` or `BkHttpComponent` by setting

```typescript
import style from 'antd/dist/antd.min.css'

class CustomButton ... {
  constructor () {
    super(...)

    this.stylesheet = style
  }
}
```

or

```typescript
import style from 'antd/dist/antd.min.css'

class CustomButton ... {
  static style = unsafeCSS(style)

  ...
}
```

or even

```typescript
import style from 'antd/dist/antd.min.css'

class CustomButton ... {
  static style = unsafeCSS(style)

  connectedCallback () {
    super.connectedCallback()
    adoptStyles(this.renderRoot as ShadowRoot, [unsafeCSS(style)])
  }
}
```