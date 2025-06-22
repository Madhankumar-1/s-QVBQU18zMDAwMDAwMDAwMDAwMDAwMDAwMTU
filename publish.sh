node ./helpers/package-json-dependencies-updater.js
pnpm i
sh ./helpers/build.sh parallel
pnpm run build

cp package.json ./dist
cp .npmrc ./dist
cp README.md ./dist

cd ./dist

pnpm run export