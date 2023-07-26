# [CR]: proč se to jmenuje Containerfile a ne Dockerfile?
# [CR]: na jaké verzi node to běží?

FROM node

ARG APP_HOST="0.0.0.0"
ARG APP_PORT=3000

ENV APP_HOST="$APP_HOST"
ENV APP_PORT=$APP_PORT

COPY . /app
WORKDIR /app
# [CR]: proč npm test?
RUN npm install && npm test
EXPOSE $APP_PORT
CMD ["npm", "start"]
