# backoffice-local
local docker-compose environment to deploy and configure backoffice

## How to install

To install the repo dependencies

```shell
yarn install
```

be sure to have [docker](https://docs.docker.com/desktop/linux/install/) and [docker-compose](https://docs.docker.com/compose/install/)
installed on your machine and to be part of the `docker` group

```shell
sudo usermod -aG docker $USER
```

otherwise run docker/docker-compose commands as root user or sudoing

## How to run

See [Docs](docs/10_overview.md)

```shell
yarn start
```

## Getting Started

Follow the [tutorial](docs/20_getting_started)
