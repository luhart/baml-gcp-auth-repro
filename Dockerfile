FROM --platform=linux/amd64 oven/bun AS build

WORKDIR /app

# Print bun version
RUN bun --version

# Fresh install of packages
COPY package.json package.json
COPY bun.lock bun.lock
RUN bun install

COPY ./src ./src

# Generate BAML client code before build
RUN bunx baml-cli generate --from src/baml_src

ENV NODE_ENV=production
ENV BAML_LOG=debug
ENV GOOGLE_CLOUD_PROJECT=sematic-cloud
ENV GOOGLE_CLOUD_LOCATION=us-west1

# RUN bun build \
# 	--compile \
# 	--minify-whitespace \
# 	--minify-syntax \
# 	--target bun \
# 	--outfile server \
# 	./src/index.ts

RUN bun build \
    --compile \
    --target bun-linux-x64	 \
    --outfile server \
    ./src/index.ts

FROM --platform=linux/amd64 oven/bun

WORKDIR /app

COPY --from=build /app/server server

ENV NODE_ENV=production
ENV GOOGLE_CLOUD_PROJECT=sematic-cloud
ENV GOOGLE_CLOUD_LOCATION=us-west1

ENV BAML_LOG=debug

CMD ["./server"]

EXPOSE 8080