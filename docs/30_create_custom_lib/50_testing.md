# Testing

Testing is supported in 2 different ways so far:

1. using [west](https://github.com/micro-lc/back-kit-engine/blob/main/west/README.md)
2. web browser native testing using [@web/test-runner](https://modern-web.dev/guides/test-runner/getting-started/)

## West

West is a JEST wrapper that emulates, for each test, a sandbox that emulates micro-lc element-composer.
It injects automatically an `eventBus` which makes the whole interface of the component being tested and
the rest of the world.

By invoking the creation script a new test file is added in the directory tree:

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
               custom-button.test.ts // 👈
</pre>

```typescript
// src/web-components/custom-button/__tests__/custom-button.test.ts

runtime.describe('custom-button tests', () => {
  runtime.it<CustomButton>('test bootstrap loading', async (helpers) => {
    // test content
  })
})
```

The API is the common testing API and supports:

1. beforeEach
2. afterEach
3. beforeAll
4. afterAll
5. describe
   1. only
   2. skip
6. it
   1. only
   2. skip
   3. each

available by pre-fixing a `runtime` imported from `@micro-lc/back-kit-engine/west`.

`helpers` contain a whole lot of [facilities](https://github.com/micro-lc/back-kit-engine/tree/main/west#how-to-use) that can be used.

Here we focus on `eventBus`, `actOnEvents`, `create`.

```typescript
runtime.it<CustomButton>('test bootstrap loading', async ({eventBus, actOnEvents, create}) => {
    const el = await create({template: html`<custom-button
        .eventBus=${eventBus}
      ></custom-button>`})

    // @ts-ignore
    el.create?.().onClick?.()

    await actOnEvents([
      {
        filter: loadingData.is,
        handler: async ({payload}) => {
          expect(payload.loading).toBe(true)

          await elementUpdated(el)
          expect(el.create?.().message).toEqual('Loading...')

          // @ts-ignore
          el.create?.().onClick?.()
        }
      },
      {
        filter: loadingData.is,
        skip: 1,
        handler: async ({payload}) => {
          expect(payload.loading).toBe(false)

          await elementUpdated(el)
          expect(el.message).toEqual('Listening...')
        }
      }
    ])
```

Notice that `.it` supports generics to infer which webcomponent interface
is being mounted on the jsdom while testing.

### create & eventBus

Takes a template to append to the document body. On `await` it completes the first
render: constructor + connectedCallback + firstUpdated (property injection) + render + reactRender.
Once completed, the webcomponent can be used.

`el` carries (after being cast by the generics) the props that will be passed to the React counterpart.
That interface is accessible by `el.create?.()`. React dependencies are mocked by default: 
check out the `testSetup.ts` file where:

1. jsdom is injected and
2. `@micro-lc/back-kit-engine/engine`, which contains all React dependencies, is mocked globally

While creating we take the one and only `eventBus` for the current
`.it` scope (there's also a `Subscription` available) and we pass it
to the webcomponent as a property.

Once this is done we are wired and we can test the whole business logic inside (whether is correct).

### actOnEvents

Acting on events, as suggested by the name, creates, through the
provided array, an array of promises. Each of those must fulfill to 
complete the test.

Initialize the promises requires filtering the `eventBus` for
some inputs returned by the tested webcomponent. By the key
`filter` you can inject a predicate. By the key `skip` or `take`
you might skip some occurrences of a filtered pipe or taking few
samples of it.

Once filtered an handler, async or sync, allows to perform
assert/expect statements to enrich the test

## E2E

End-to-end testing can be done directly into the browser.

```typescript
// 👈 imports here
import '<rootDir>/src/web-components/custom-button/custom-button'

describe('modal with slotted child tests', () => {
  afterEach(() => {
    fixtureCleanup()
  })

  it('should render a form within a modal', async () => {
    const _ = new ReplaySubject() as EventBus

    const formModal = await fixture(html`
      <custom-button .eventBus=${_}></custom-button>
    `) as CustomFormModal

    // test expects/asserts goes here
  })
})
```

Then just run `wds` from command line with the browser you 
support on you local machine like

```shell
yarn web-test-runner --node-resolve test/**/*.test.ts --playwright --browsers firefox
```