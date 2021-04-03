# Summary
This repo demonstrates an issue with nx workspaces, where I try to reuse a library from one nx workspace in another either by manually symlinking a library or use NPM 7 workspaces.  If I replace the symlink with copying the whole library directory from one workspace to the other then everything works, so I think this might be a simple symlink issue.

The [master](https://github.com/jonstelly/nx-multi/tree/master) branch has the results of only the Initial/Clean block below.  The [feature/symbolic-link](https://github.com/jonstelly/nx-multi/tree/feature/symbolic-link) branch has the results of the symlink section (***except for creating the symbolic link which you'll need to do yourself after cloning***)

## Steps to reproduce

PowerShell on Linux
```pwsh
git clone -b feature/symbolic-link
cd nx-multi
ln -sd "$pwd/fw/libs/fw" ./app/libs/fw
```

Bash on Linux
```pwsh
git clone -b feature/symbolic-link
cd nx-multi
ln -sd "$(PWD)/fw/libs/fw" ./app/libs/fw
```

1. Copy the fw-core project element from `fw/angular.json` to `app/angular.json`
2. Add the corresponding entry to nx.json: `"fw-core": { "tags": [] }`.
3. Add `"@fw/core": ["libs/fw/core/src/index.ts"]` to the paths in `app/tsconfig.base.json`
4. `nx serve` from the `app` directory

Browser loads as expected

5. Modify `app/apps/src/app/app.component.html` and add `<fw-image></fw-image>` in the main section
6. Modify `app/apps/src/app/app.module.ts` and add `import { FwCoreModule } from '@fw/core';` and add `FwCoreModule` to the module imports
7. Save the above modifications

Now the angular build/serve fails with:

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

If I break the symlink and copy the contents of `fw/libs/fw` to `app/libs/fw`, everything works, which suggests it's just a symlink issue.  I tried the same thing with NPM 7 workspaces and get a similar end result as just using a manual symlink.

## Full Steps to Create this repository from scratch
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
```

