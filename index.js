var through = require('through');
var path = require('path');
var gutil = require('gulp-util');
var _ = require('lodash');
var PluginError = gutil.PluginError;
var File = gutil.File;

module.exports = function (fileName, options) {
  if (!fileName) {
    throw new PluginError('gulp-combine-languagefiles', 'Missing fileName option for gulp-combine-languagefiles');
  }
  if(typeof options !== 'object') {
    options = {};
  }

  var data = [];
  var result = [];
  var LANGS = [];
  var PATH, LANG = '';
  var firstFile = null;

  function bufferContents(file) {
    if (!firstFile) {
      firstFile = file;
    }

    if (file.isNull()) {
      return; // ignore
    }
    if (file.isStream()) {
      return this.emit('error', new PluginError('gulp-combine-languagefiles', 'Streaming not supported'));
    }

    var jsonData = JSON.parse(file.contents.toString());

    /* Extract file name and language */
    /* Expects files to be named en.json or en-EN.json or similar */
    var fileName = file.relative.split('/').slice(-1)[0];
    var lang = fileName.split('.').slice(0)[0];

    /* Parse & include original path so it can be restored later */
    var path = file.relative.toString().replace(fileName, '');

    var json = {
      path: path,
      lang: lang,
      value: jsonData
    }

    /* Gather all languages in the project */
    if(!_.contains(LANGS, lang)) {
      LANGS.push(lang);
    }

    data.push(json);
  }

  function endStream() {
    var joinedPath = path.join(firstFile.base, fileName);

    /* Loop through all found translations and combine result in desired format */
    _.each(data, function(val) {
      LANG = val.lang;
      PATH = val.path;
      iterateValues(val.value);
    });

    result = _.sortBy(result, 'path');

    if(options.includeHeader) {
      /* Include header as first item, for example if we are generating a CSV */
      var header = [
        'Path', 'Key'
      ].concat(LANGS);

      result.unshift(header);
    }

    var joinedFile = new File({
      cwd: firstFile.cwd,
      base: firstFile.base,
      path: joinedPath,
      contents: new Buffer(JSON.stringify(result))
    });

    this.emit('data', joinedFile);
    this.emit('end');
  }

  function iterateValues(val, key) {
    _.each(val, function(v, k) {
      /* Nested keys are joined using | . Resulting object is one dimentional */
      if(key) k = key+'|'+k;
      if(typeof v === 'object') {
        iterateValues(v, k);
      } else {
        var obj = {
          path: PATH,
          key: k
        };
        var index = _.findIndex(result, obj);

        if(index !== -1) {
          /* Update translation for existing key */
          result[index][LANG] = v;
        } else {
          /* No existing key found, insert it and initialize all languages as empty */
          _.each(LANGS, function(l) {
            obj[l] = '';
          });
          obj[LANG] = v;
          result.push(obj);
        }
      }
    });
  }

  return through(bufferContents, endStream);
};
