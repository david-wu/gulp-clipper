
Gulp Clipper
============

Clip text from your code and puts it into JavaScript variables.


### Why would I want to use this?
  * You're making demos and want to show the demo's code without copy/paste
  * You have a markdown text and don't want to escape things like `` ` `` and `#` .


### Usage

```javascript
@gulpClipperStart:funkyFunc:
function test(){
	console.log('heres how this function works', window.gulpClips.funkyFunc);
}
@gulpClipperStop:funkyFunc:

test();
```

output:
```javascript
'function test(){\n\tconsole.log('heres how this function works', window.gulpClips.funkyFunc);\n}'
```

### Setup

`npm install --save-dev gulp-clipper`

gulpfile.js
```javascript
var gulp = require('gulp');
var clipper = require('gulp-clipper');

gulp.task('gulpClips', function(){
    gulp.src(['./**/*'])
        .pipe(clipper('gulpClips.js'))
        .pipe(gulp.dest('./assets'))
});
```

index.html
```html
<html>
	<body>
		<script src="gulpClip.js"></script>
	</body>
</html>
```
