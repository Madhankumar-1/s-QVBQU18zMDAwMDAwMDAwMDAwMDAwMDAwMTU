// scripts/merge-deps.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Static import of root package.json (Node.js 17.5+)
import rootPkg from '../package.json' with { type: 'json' };

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const collectDeps = () => {
    const deps = {};
    const lambdaDir = path.join(__dirname, '../lambda');

    if (!fs.existsSync(lambdaDir)) {
        console.error('Lambda directory not found');
        return deps;
    }

    const lambdaFolders = fs.readdirSync(lambdaDir);

    lambdaFolders.forEach((lambda) => {
        const pkgPath = path.join(lambdaDir, lambda, 'src', 'package.json');

        if (fs.existsSync(pkgPath)) {
            try {
                // Read JSON file synchronously (simpler than import)
                const pkgContent = fs.readFileSync(pkgPath, 'utf8');
                const pkg = JSON.parse(pkgContent);

                if (pkg.dependencies) {
                    Object.assign(deps, pkg.dependencies);
                }
            } catch (err) {
                console.error(`Error processing ${pkgPath}:`, err);
            }
        }
    });

    return deps;
};

const updateRootPackage = () => {
    const newDeps = collectDeps();
    const updatedPkg = {
        ...rootPkg,
        dependencies: {
            ...rootPkg.dependencies,
            ...newDeps
        }
    };

    fs.writeFileSync(
        path.join(__dirname, '../package.json'),
        JSON.stringify(updatedPkg, null, 2) + '\n'
    );

    console.log('Successfully updated root package.json');
};

updateRootPackage();