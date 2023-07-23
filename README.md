# OICT Card Assignment

## Usage

The app is temporarily deployed on <http://tmp.davidstraka.dev:3000>.

To run it locally, Docker (or alternatives, e.g. Podman) can be used.

To start the HTTP server:

```sh
docker compose up
```

(or `docker compose up -d` to run in detached mode). The server should be available by default on <http://localhost:3000>.

Tests are run when building the app OCI image. To run them again manually:

```sh
docker compose run app npm test
```

## Docs

API documentation in the OpenAPI format is located in `docs/openapi.json`. The docs can be viewed using Swagger UI on <http://tmp.davidstraka.dev:3000/docs/openapi>, respectively <http://localhost:3000/docs/openapi>.

## Access Token

The access token (`X-Access-Token`) for now is just the string `test`.
