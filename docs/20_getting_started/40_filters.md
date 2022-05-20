# Filters

We keep an eye on the `customers` collection and we could enhance
it with some filtering features:

1. tabs to filter, say, customers with public `__STATE__`
2. a search bar
3. custom filters to divide customers with active orders from those who are not ordering at the current time.

## Tabs

The `bk-tabs` component is meant to be used as switch between different 
filterings of the same collection.

First we must add `__STATE__` to the dataSchema.

```json
// micro-lc/customers.json

{
  "$ref": {
    "dataSchema": {
      ...,
      "properties": {
        ...,
        "__STATE__": {
          "type": "string",
          "enum": ["PUBLIC", "DRAFT", "TRASH"],
          "visualizationOptions": {
            "hidden": true
          },
          "filtersOptions": {
            "hidden": true
          },
          "formOptions": {
            "hidden": true
          }
        },
        ...
      }
    },
    ...
  }
}
```

Notice that:

- `visualizationOptions` hide `__STATE__` from the `bk-table`
- `formOptions` from the edit/add new form
- and consequentle `filtersOptions` will hide it from user filter options (but this won't affect the client since tabs will be filtering on `__STATE__`)

From a layout standpoint we would like to place tabs at the bottom
of the header right above the gray area surrounding the table.

Hence we lift the header by a column-flex-boxed div from this:

```json
// mocks/customers.json

{
  ...,
    { // HEADER
      "type": "column",
      "attributes": {
        "style": "justify-content: space-between; padding: 10px 40px; border-bottom: 1px solid #ccc;"
      },
      "content": [
        "type": "column",
        "attributes": {
          "style": "align-items: center;"
        },
        ...
  }
}
```

to this:

```json
// mocks/customers.json

{
  ...,
    { // HEADER
      "type": "row",
      "attributes": {
        "style": "justify-content: space-between; border-bottom: 1px solid #ccc;"
      },
      "content": [
        {
          "type": "column",
          "attributes": {
            "style": "justify-content: space-between; padding: 10px 40px;"
          },
          "content": [
            {
              "type": "column",
              "attributes": {
                "style": "align-items: center;"
              },
        ...
  }
}
```

hence we can add another row

```json
// mocks/customers.json

{
  ...,
    { // HEADER
      "type": "column",
      "attributes": {
        "style": "justify-content: space-between; border-bottom: 1px solid #ccc;"
      },
      "content": [
        {
          "type": "column",
          "attributes": {
            "style": "justify-content: space-between; padding: 10px 40px;"
          },
          "content": [
            {
              ...
            },
            { // 👈 new tabs start here
              "type": "element",
              "tag": "bk-tabs",
              "attributes": {
                "style": "margin-bottom: -10px"
              },
              "properties": {
                "tabs": [
                  {
                    "key": "public",
                    "title": {
                      "en": "Public",
                      "it": "Pubblici"
                    },
                    "filters": [
                      {
                        "property": "__STATE__",
                        "operator": "equal",
                        "value": "PUBLIC"
                      }
                    ]
                  },
                  {
                    "key": "draft-trash",
                    "title": {
                      "en": "Drafted or Trashed",
                      "it": "Draft o Eliminati"
                    },
                    "filters": [
                      {
                        "property": "__STATE__",
                        "operator": "includeSome",
                        "value": ["DRAFT", "TRASH"]
                      }
                    ]
                  }
                ]
              }
            }
          ]
        }
      ]
    },
    ...
}
```

We configured 2 tabs with their respective filters 
(notice they could support an array of filters each). 
The tabs key is an implementation
feature which allows the CRUD client to write a single reference to 
the URL such that copy/pasting the page href is enough to 
reproduce the page state.

Beside naming/labelling on the `title` property, each `tab` filter contains
the following object type

```typescript
type Filter = {
  operator:
    | "equal"
    | "notEqual"
    | "greater"
    | "greaterEqual"
    | "less"
    | "lessEqual"
    | "regex"
    | "includeSome"
    | "includeAll"
    | "includeExactly"
    | "notIncludeAny"
  property: string
  value: string | number | boolean | any[]
}
```

and value is given accordingly with the operator of choice. As you noticed 
above an `includeSome` operator expects an array of values.

By refreshing the browser you'll see those tabs appear.

## Search Bar

Placing the search bar turns out to be quite simple since it could be
displayed in between title/refresh area and add-new button

```json
// mocks/customers.json

{
  ...
        {
          "type": "element",
          "tag": "bk-search-bar",
          "properties": {
            "placeholder": {
              "en": "Search...",
              "it": "Cerca..."
            }
          }
        },
        { // 👆 right above the bk-add-new-button
          "type": "element",
          "tag": "bk-add-new-button"
        }
      ]
    },
  ...
}
```

The search bar is allowed to search on primitive string values. Search can be 
extended to lookups by adding a specific property on `bk-search-bar` and on
`dataSchema`.

```json
// mocks/customers.json

{
  ...
    {
      "type": "element",
      "tag": "bk-search-bar",
      "properties": {
        "searchLookups": true, // 👈
        "placeholder": {
          "en": "Search...",
          "it": "Cerca..."
        }
      }
    },
  ...
}
```

Since we'd like to search on `cityOfBirth` lookup, edit the `dataSchema` as follows:

```json
{
  "$ref": {
    "dataSchema": {
      ...,
      "properties": {
        ...,
        "cityOfBirth": {
          ...,
          "excludeFromSearch": false, // 🥳
          ...
        }
        ...
      }
    }
  }
  ...
}
```

Search on lookups is disabled since it could be rather costly hence it requires
some backend performance architectural reasoning (indexing, collation and such...).

## Custom Filters

The user might want to introduce its own filter to easily access data. Three
components are devoted to this scope.

- `bk-filters-manager` => fancy visualization tooltip that allows toggling filters
- `bk-filter-drawer` => form to insert new filters
- `bk-add-new-filter` => button to open filter insert context

The drawer can be added anywhere within the `bk-table` container

```json
// mocks/customers.json

{
  ...,
    { // 👆 `bk-form-modal`
      // should be up here
      "type": "element",
      "tag": "bk-filter-drawer",
      "properties": {
        "dataSchema": {
          "$ref": "dataSchema"
        }
      }
    }
}
```

A tailored button can be used to open it. Let's wrap di `bk-add-new-button` with a 
new div and pair it with the `bk-add-filter-button`

```json
// mocks/customers.json
{
  ...,
    {
      "type": "column",
      "content": [
        {
          "type": "element",
          "tag": "bk-add-filter-button",
          "attributes": {
            "style": "margin-right: 20px;"
          }
        },
        {
          "type": "element",
          "tag": "bk-add-new-button"
        }
      ]
    },
  ...
}
```

Let's also wrap `bk-tabs` in a new div and embed the `bk-filters-manager` on its right
side: 

```json
// mocks/customers.json

{
  ...,
    {
      "type": "column",
      "attributes": {
        "style": "justify-content: space-between; align-items: center; margin-left: 25px; margin-right: 25px;"
      },
      "content": [
        {
          "type": "element",
          "tag": "bk-tabs",
          "properties": {
            ...
          }
        },
        {
          "type": "element",
          "tag": "bk-filters-manager"
        }
      ]
    },
  ...
}
```

Let's also remove the `_id` from the searchable fields by setting in the `dataSchema`, that 
`_id`'s `filtersOptions` are `{"hidden": true}`.
