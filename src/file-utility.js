// TODO split file functions to their own dep injected class of functions
// TODO start replacing specific calls (ie getRandom, getPopular) with query calls
// TODO replace all external specific calls with queries in wiki
const debug = require('debug')('Uttori.StorageProvider.JSON');
const fs = require('fs-extra');
const sanitize = require('sanitize-filename');
const R = require('ramda');
const path = require('path');

/**
  * File manipulation utilities for files stored on the local file system.
  * @class
  */
class FileUtility {
  static ensureDirectoriesSync({ content_dir, history_dir, data_dir }) {
    try {
      fs.ensureDirSync(content_dir, { recursive: true });
      fs.ensureDirSync(history_dir, { recursive: true });
      fs.ensureDirSync(data_dir, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        debug('Error creting directories:', error);
      }
    }
  }

  /**
   * Deletes a file from the file system.
   * @async
   * @param {object} config - The configuration object.
   * @param {string} config.extension - The file extension of the file to be deleted.
   * @param {string} folder - The folder of the file to be deleted.
   * @param {string} name - The name of the file to be deleted.
   * @memberof FileUtility
   */
  static async deleteFile({ extension }, folder, name) {
    debug('deleteFile:', folder, name);
    const target = `${folder}/${sanitize(`${name}`)}.${extension}`;
    debug('Deleting target:', target);
    try { await fs.unlink(target); } catch (error) {
      /* istanbul ignore next */
      debug('Error deleting file:', target, error);
    }
  }

  /**
   * Reads a file from the file system.
   * @async
   * @param {object} config - The configuration object.
   * @param {string} config.extension - The file extension of the file to be read.
   * @param {string} folder - The folder of the file to be read.
   * @param {string} name - The name of the file to be read.
   * @returns {Object} - The parsed JSON file contents.
   * @memberof FileUtility
   */
  static async readFile({ extension }, folder, name) {
    debug('Reading File:', folder, name);
    const target = `${folder}/${sanitize(`${name}`)}.${extension}`;
    debug('Reading target:', target);
    let content;
    try { content = await fs.readFile(target, 'utf8'); } catch (error) {
      /* istanbul ignore next */
      debug('Error reading file:', target, error);
    }
    try { content = JSON.parse(content); } catch (error) {
      /* istanbul ignore next */
      debug('Error parsing JSON:', content, error);
    }
    return content;
  }

  /**
   * Reads a folder from the file system.
   * @async
   * @param {object} config - The configuration object.
   * @param {string} config.extension - The extention of valid files to read.
   * @param {string} folder - The folder to be read.
   * @returns {string[]} - The file paths found in the folder.
   * @memberof FileUtility
   */
  static async readFolder(folder) {
    debug('Reading Folder:', folder);
    if (await fs.exists(folder)) {
      const content = await fs.readdir(folder);
      return content.map(file => path.parse(file).name);
    }
    debug('Folder not found!');
    return [];
  }

  /**
   * Write a file to the file system.
   * @async
   * @param {object} config - The configuration object.
   * @param {string} config.extension - The file extension of the file to be written.
   * @param {string} folder - The folder of the file to be written.
   * @param {string} name - The name of the file to be written.
   * @param {string} content - The content of the file to be written.
   * @memberof FileUtility
   */
  static async writeFile({ extension }, folder, name, content) {
    debug('writeFile:', folder, name, content);
    const target = `${folder}/${sanitize(`${name}`)}.${extension}`;
    debug('Writing target:', target);
    try { await fs.writeFile(target, content, 'utf8'); } catch (error) {
      /* istanbul ignore next */
      debug('Error writing file:', target, content, error);
    }
  }
}

module.exports = FileUtility;
