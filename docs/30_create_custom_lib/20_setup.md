# Setup

Please ensure you have `node` installed on your machine.

## Case 1: follow the tutorial in this repository (fork of @micro-lc/backoffice-local)

We will use `yarn` workspace concepts, hence ensure you've got a key `workspaces` in your `package.json`

```json
# package.json
{
  ...,
  "workspaces": ["packages/*"],
  ...
}
```

otherwise add it.
Ensure you are in this project root dir on your shell and run:

```shell
# from root dir

mkdir -p packages
cd packages

yarn create-lib
```

These commands created a new directory `packages` (which should anyway be there already),
then moved into it and run the cli script to spawn a new library.
When prompted:

1. insert the name of your library (we will use `custom-lib`),
2. choose whether you want opt in for typescript (we will in this tutorial but it doesn't affect the tutorial that much),
3. refuse to create a git repository since we already have one and,
4. default the last question

then let's move inside the newly created lib and let's make it apt for a workspace by removing some stuff

```shell
# from ./packages

cd custom-lib
rm -rf .yarn .yarnrc.yml yarn.lock

cd ../../
```

and we're back to root dir, please check that everything went ok by running

```shell
yarn install
yarn workspace custom-lib test
```

obviously use the library name you prompted in the cli steps.

## Case 2: create your own repository

In your main dir launch,

```shell
npx -y -p @micro-lc/backoffice-local-cli create-lib
```

or, with yarn 2+,

```shell
yarn dlx -p @micro-lc/backoffice-local-cli create-lib
```

When prompted,

1. insert the name of your library (we will use `custom-lib`),
2. choose whether you want opt in for typescript (we will in this tutorial but it doesn't affect the tutorial that much),
3. choose whether you want to initialize a git repository,
4. default the last question

Please check that everything went ok by running

```shell
cd custom-lib

yarn install
yarn test
```

or with npm

```shell
cd custom-lib

npm install
npm run test
```

where custom-lib must be replaced by the name you gave to your new custom library.
Since the newly created repository comes with out-of-the-box support for `yarn` stable, 
if you want to opt-in for `npm` you could (but it'd work anyway) remove all `yarn`-related
files

```shell
rm -rf .yarn .yarnrc.yml yarn.lock
```
