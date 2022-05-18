# Lookups

Let's move on to the `cities/customers` pair.

`cities` here will be a support collection without a visualization plugin, whereas
`customers` will use it as a reference or in jargon a `lookup`.

## Backend

Let's create the cities CRUD via `yarn mgmt` by using the provided file template.
(Just follow the prompted defaults)

Let's override the output file a bit

```javascript
// mocks/cruds/cities.js

const Cities = require('../utils/crud-interface')
const {
  crudBaseGenerator,
} = require('../utils/generators')
const c = require('cities.json')

const mockCities = () =>
  c.map(({name}) => {
    return {
      ...crudBaseGenerator(),
      __STATE__: 'PUBLIC',
      name
    }
  })

const cities = new Cities(0, mockCities, true)

module.exports = cities
```

and we could check everything went ok by inspecting

```shell
curl "http://localhost/v2/cities?_l=2&_sk=0" | jq
curl "http://localhost/v2/cities/count" | jq
```

Now let's create a CRUD for `customers` again via `yarn mgmt` which can be named 
`customers`.

Customers will have:

1. firstName
2. lastName
3. cityOfBirth
4. address
5. activeOrders
6. pastOrders

so let's add some generators

```javascript
// mocks/cruds/customers.js

const Customers = require('../utils/crud-interface')
const {
  crudBaseGenerator,
  genFirstName,
  genLastName,
  addressGenerator,
  randomNumber
} = require('../utils/generators')

const mockCustomers = (quantity) =>
  Array(quantity)
    .fill(0)
    .map(() => {
      return {
        ...crudBaseGenerator(),
        firstName: genFirstName(),
        lastName: genLastName(),
        cityOfBirth: '',
        address: addressGenerator(),
        activeOrders: randomNumber(0, 2),
        pastOrders: randomNumber(0, 200)
      }
    })

// continues here with exports ...
```

hence, `cityOfBirth` must be a `lookup` hence we import the `cities` CRUD

```javascript
// mocks/cruds/customers.js

const {getRandomFromCollection} = require('../utils/generators')
const cities = require('./cities')
```

and we set `cityOfBirth` as a random city `_id`.

```javascript
return {
  ...,
  cityOfBirth: getRandomFromCollection(cities.items)._id,
  ...
}
```

Let's than take a look at the output 

```shell
curl "http://localhost/v2/customers?_l=1&_sk=0" | jq
```

and we get something like 

```json
[
  {
    "_id": "628542fa839641328e11e9af",
    "creatorId": "628542fa2a813ff53aa18348",
    "createdAt": "2022-05-18T13:17:20.151Z",
    "updaterId": "628542fa2a813ff53aa18348",
    "updatedAt": "2022-05-18T13:17:20.151Z",
    "__STATE__": "PUBLIC",
    "firstName": "Kay",
    "lastName": "McMechan",
    "cityOfBirth": "628542f99683be85bc389ec8",
    "address": "83 F street, Oslo Qassem State, 99625",
    "activeOrders": 1,
    "pastOrders": 77
  }
]
```

## Frontend Plugin

Let's add a new plugin to the micro-lc configuration

```json
// micro-lc/configuration.json
{
  ...,
  "plugins": [
    ..., // 👈 here's riders plugin
    {
      "id": "customers",
      "label": "Customers",
      "icon": "fas fa-users",
      "integrationMode": "qiankun",
      "pluginRoute": "/bo-customers",
      "pluginUrl": "/element-composer/",
      "props": {
        "configurationName": "customers"
      }
    }
  ],
  ...
}
```

and accordingly create a `<rootDir>/micro-lc/customers.json` file.

Since we already covered layout basics we start with the `dataSchema` and
we could recover `_id`, `firstName`, `lastName` from `riders.json` 

```json
// micro-lc/customers.json

{
  "$ref": {
    "dataSchema": {
      "type": "object",
      "properties": {
        "_id": {
          ...
        },
        "firstName": {
          ...
        },
        "lastName": {
          ...
        },
        "cityOfBirth": {
          "type": "string",
          "label": {
            "en": "City Of Birth",
            "it": "Luogo di Nascita"
          }
        },
        "address": {
          "type": "string",
          "label": {
            "en": "Address",
            "it": "Indirizzo"
          }
        },
        "activeOrders": {
          "type": "number",
          "label": {
            "en": "Active Orders",
            "it": "Ordini Attivi"
          }
        },
        "pastOrders": {
          "label": {
            "en": "Past Orders",
            "it": "Ordini Passati"
          }
        }
      }
    }
  },
  "content": {
    ...
  }
}
```

Most of `riders` layout is similar with few changes

### Title

```json
// micro-lc/customers.json

{
  ...
    {
      "type": "element",
      "tag": "bk-title",
      ...,
      "properties": {
        "content": {
          "en": "Customers",
          "it": "Clienti"
        }
      }
    }
  ...
}
```

### `bk-button` becomes `bk-add-new-button`

```json
// micro-lc/customers.json

{
  ...,
  {
    "type": "element",
    "tag": "bk-add-new-button"
  },
  ...,
}
```

### `bk-crud-client`

```json
// micro-lc/customers.json

{
  ...
    {
      "type": "element",
      "tag": "bk-crud-client",
      "properties": {
        "basePath": "/v2/customers" // 👈
      }
    }
  ...
}
```

if you refresh `localhost` you will find a new plugin.

Unfortunately, `cityOfBirth` lookup has not been resolved and we didn't even
specified the nature of such `_id` to the plugin.

For that we have another webcomponents called `bk-crud-lookup-client`. Let's update
the `dataSchema` with 3 information

1. to which collection does `cityOfBirth` refer => `cities` which is the `lookupDataSource`
2. which field of the `cities` collection we hold on `customers` => `_id` which is the `lookupValue`
3. which fields we must recover from `cities` to resolve the lookup => `name` which enters an array called `lookupFields`

and optionally (but we won't use it here) queries, dependencies and delimiters/templates to
concatenate multiple `lookupFields`

In our case we've got 

```json
// micro-lc/customers.json

{
  ..., // 👈 within dataSchema
  "cityOfBirth": {
    "type": "string",
    "format": "lookup",
    ...,
    "lookupOptions": {
      "lookupDataSource": "cities",
      "lookupValue": "_id",
      "lookupFields": ["name"]
    }
  }
  ...
}
```

and just add to the bottom of your `customers` config
the `bk-crud-lookup-client`

```json
// micro-lc/customers.json

{
  ...,
    {
      "type": "element",
      "tag": "bk-crud-lookup-client",
      "properties": {
        "basePath": "/v2",
        "dataSchema": {
          "$ref": "dataSchema"
        }
      }
    },
  ...
}
```

## Play around 

There should be `128769` cities and accessing edit mode on any line, or 
by adding a new customer a lookup selector is available for `cityOfBirth`.

Options are fetched dynamically on user input. That system can be provided of 
a session cache by adding the property `allowLiveSearchCache` to `true`.
