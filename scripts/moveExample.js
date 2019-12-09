const fs = require('fs');
const path = require('path');
const util = require('util');

const readdir = util.promisify(fs.readdir);
const mkdir = util.promisify(fs.mkdir);
const exists = util.promisify(fs.exists);
const move = util.promisify(fs.rename);
const remove = util.promisify(fs.unlink);

async function doWork() {
  const demoDistPath = path.join(__dirname, '../demo/dist');
  const files = await readdir(demoDistPath);

  const mkdirIfDoesNotExist = async (path) => {
    if (!(await exists(path))) {
      await mkdir(path);
    }
  };

  const targetDistPath = path.join(__dirname, '../docs/.vuepress/dist');
  await mkdirIfDoesNotExist(targetDistPath);
  const distExamplePath = path.join(targetDistPath, 'example');
  await mkdirIfDoesNotExist(distExamplePath);

  for (const file of files) {
    const filePath = path.join(demoDistPath, file);
    const fileTargetPath = path.join(distExamplePath, file);
    await move(filePath, fileTargetPath);
  }
}

return doWork();
