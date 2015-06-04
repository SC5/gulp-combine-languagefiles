# gulp-combine-languagefiles

> Gulp plugin to combine several (nested) JSON language files
> Create easily editable CSV so non-programmers can help with translations

This plugin was originally made to be used with [gulp-bobrsass-boilerplate / angularjs](https://github.com/SC5/gulp-bobrsass-boilerplate/tree/angularjs), but it should work with other projects too using JSON key-value -pair translations. It expects translations to be named as `en.json`, `en-EN.json` or similar. Your project tree might look for example like

	src/
		app/
			module1/
				languages/
					en.json
					fi.json
			module2/
				languages/
					en.json
					fi.json

## Usage

Install `gulp-combine-languagefiles` as a development dependency:

```shell
npm install --save-dev gulp-combine-languagefiles
```

Add it to your `gulpfile.js`:

```javascript
var combine_languagefiles = require("gulp-combine-languagefiles");

gulp.src("src/app/**/languages/*.json")
	.pipe(combine_languagefiles("translations.json"))
	.pipe(gulp.dest(""));
```

You can use gulp-convert to convert result to CSV. Use `includeHeader` parameter to prepend header as first row.

```javascript
var concat_json = require("gulp-concat-languagefiles");
var convert = require("gulp-convert");

gulp.src("src/app/**/languages/*.json")
	.pipe(combine_languagefiles("translations.json", { includeHeader: true }))
	.pipe(convert({from: 'json', to: 'csv'}))
	.pipe(gulp.dest("")); // File will be saved as translations.csv to project root
```

See /example for a script to parse generated CSV back to original JSON-files, it even supports downloading CSV from Google Drive!
