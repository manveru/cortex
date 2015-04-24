var gulp = require("gulp"),
    gutil = require("gulp-util"),
    browserify = require("browserify"),
    source = require('vinyl-source-stream'),
    uglify = require("gulp-uglify"),
    streamify = require("gulp-streamify"),
    rename = require("gulp-rename"),
    react = require("gulp-react"),
    babel = require('gulp-babel'),
    to5ify = require('babelify'),
    jasmine = require("gulp-jasmine");
    derequire = require('gulp-derequire');

gulp.task("scripts", function() {
  gulp.src(["./src/**/*.js"])
    .pipe(babel())
    .on("error", gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(gulp.dest("./build"))
    .pipe(streamify(uglify()))
    .pipe(rename("cortex.min.js"))
    .pipe(gulp.dest("build"));
});

gulp.task("test", function() {
  var tests = [
    "test/cortex_test.js",
    "test/data_wrapper_test.js",
    "test/pubsub_test.js",
    "test/wrappers/array_test.js",
    "test/wrappers/hash_test.js"
  ];

  for(var i=0,ii=tests.length;i<ii;i++) {
    browserify("./" + tests[i])
      .transform(to5ify)
      .bundle()
      .on("error", gutil.log.bind(gutil, 'Browserify Error'))
      .pipe(source(tests[i]))
      .pipe(gulp.dest("temp")) // output to temp b/c node does not recognize es6 feature,
      .pipe(streamify(jasmine()));
  }
});

gulp.task("react", ["scripts"], function() {
  var examples = [
    "file_system",
    "skyline"
  ];

  for(var i=0, ii=examples.length;i<ii;i++) {
    gulp.src(["examples/" + examples[i] + "/application.jsx"])
      .pipe(react())
      .pipe(gulp.dest("examples/" + examples[i]));
  }
});

gulp.task("default", ["scripts"], function() {
  gulp.watch("src/**", ["scripts"]);
});
