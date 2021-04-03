# Summary
This repo demonstrates an issue with nx workspaces, where I try to reuse a library from one nx workspace in another either by manually symlinking a library or use NPM 7 workspaces.  If I replace the symlink with copying the whole library directory from one workspace to the other then everything works, so I think this might be a simple symlink issue.

## Steps to reproduce

```powershell
git clone https://github.com/jonstelly/nx-multi.git
cd nx-multi

# RUN ONE OF THESE DEPENDING ON YOUR SHELL
# Powershell
ln -sd "$pwd/fw/libs/fw" ./app/libs/fw
# Bash
ln -sd "$(pwd)/fw/libs/fw" ./app/libs/fw

cd app
npm install
nx serve or nx build
```

## Results

The angular build/serve fails with:

```log
Error: ../fw/libs/fw/core/src/index.ts
Module build failed (from ./node_modules/@ngtools/webpack/src/ivy/index.js):
Error: /home/jon/code/misc/nx-multi/fw/libs/fw/core/src/index.ts is missing from the TypeScript compilation. Please make sure it is in your tsconfig via the 'files' or 'include' property.
    at /home/jon/code/misc/nx-multi/app/node_modules/@ngtools/webpack/src/ivy/loader.js:42:26

Error: ../fw/libs/fw/core/src/lib/image/image.component.ts
Module build failed (from ./node_modules/@ngtools/webpack/src/ivy/index.js):
Error: /home/jon/code/misc/nx-multi/fw/libs/fw/core/src/lib/image/image.component.ts is missing from the TypeScript compilation. Please make sure it is in your tsconfig via the 'files' or 'include' property.
    at /home/jon/code/misc/nx-multi/app/node_modules/@ngtools/webpack/src/ivy/loader.js:42:26
```

## Notes

- If you break the symlink and copy the contents of `fw/libs/fw` to `app/libs/fw` then everything works which suggests it's entirely a symlink issue.  I tried the same thing with NPM 7 workspaces and get a similar end result as just using this manual symlink.

- I'd actually prefer to use NPM workspaces but I figured this was a more direct way to reproduce the issue.

- Using the symlink, if I remove the `FwCoreModule` import and remove `<fw-image></fw-image>` from the app.component.html, the app builds which seems to mean that the typescript compilation is OK.  The User class in the app derives from the Aggregate class in fw/core.  So it seems like exclusively an ivy issue with the symlink


# Full Steps to Create this repository from scratch
```powershell
mkdir nx-multi
cd nx-multi
npx create-nx-workspace fw --preset=angular --appName=fw-example --style=scss --linter=eslint --nx-cloud=false
npx create-nx-workspace app --preset=angular --appName=my-app --style=scss --linter=eslint --nx-cloud=false
cd fw
nx g lib fw/core --importPath="@fw/core" --publishable=true --buildable=true
cd ../app
nx g lib app/core --importPath="@app/core" --publishable=true --buildable=true
cd ../
cd ./fw/libs/fw/core/src/lib
nx g c Image --export
echo "export abstract class Aggregate { id: string; }" > ./aggregate.ts
cd ../
echo "export * from './lib/aggregate';" >> index.ts
cd ../../../../..
git init
git commit -m 'initial commit'
ln -sd "$(pwd)/fw/libs/fw" ./app/libs/fw
```

Finally, copy the `fw-core` section from `fw/angular.json` to `app/angular.json`.  Copy the `fw-core` entry from `fw/nx.json` to `app/nx.json`.  Add `"@fw/core": ["libs/fw/core/src/index.ts"]` path entry to the `app/tsconfig.base.json`

