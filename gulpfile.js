const critical = require('critical');
const babelify = require('babelify');
const browserSync = require('browser-sync');
const browserify = require('browserify');
const buffer = require('vinyl-buffer');
const gulp = require('gulp');
const plugins = require('gulp-load-plugins');
const source = require('vinyl-source-stream');


/* ----------------- */
/* Development
/* ----------------- */

gulp.task('development', ['scripts', 'templates', 'styles'], () => {
  browserSync({
    server: {
      baseDir: './build/'
    },
    open: false,
    online: false,
    notify: false,
    snippetOptions: {
      rule: {
        match: /<\/body>/i,
        fn: (snippet) => snippet
      }
    }
  });

  gulp.watch('./app/assets/sass/**/*.scss', ['styles']);
  gulp.watch('./app/assets/js/**/*.js', ['scripts']);
  gulp.watch('./app/**/*.nunjucks', ['templates']);
});


/* ----------------- */
/* Scripts
/* ----------------- */

gulp.task('scripts', () => {
  return browserify({
    'entries': ['./app/assets/js/main.js'],
    'debug': true,
    'transform': [
      'babelify', {
        'presets': ['es2015']
      }
    ]
  })
  .bundle()
  .on('error', function () {
    var args = Array.prototype.slice.call(arguments);

    plugins().notify.onError({
      'title': 'Compile Error',
      'message': '<%= error.message %>'
    }).apply(this, args);

    this.emit('end');
  })
  .pipe(source('bundle.js'))
  .pipe(buffer())
  .pipe(plugins().sourcemaps.init({'loadMaps': true}))
  .pipe(plugins().sourcemaps.write('.'))
  .pipe(gulp.dest('./build/js/'))
  .pipe(browserSync.stream());
});



/* ----------------- */
/* Templates
/* ----------------- */
gulp.task('templates', () => {
  return gulp.src('./app/pages/**/*.+(html|nunjucks)')
    .pipe(plugins().data(function() {
      return require('./app/data.json')
    }))
    .pipe(plugins().nunjucksRender({
      path: ['./app/templates']
    }))
    .pipe(gulp.dest('build'))
    .pipe(browserSync.stream());
});


/* ----------------- */
/* Styles
/* ----------------- */

gulp.task('styles', () => {
  return gulp.src('./app/assets/sass/**/*.scss')
    .pipe(plugins().sourcemaps.init())
    .pipe(plugins().autoprefixer({
      browsers: ['last 2 versions'],
      cascase: false
    }))
    .pipe(plugins().sass().on('error', plugins().sass.logError))
    .pipe(plugins().sourcemaps.write())
    .pipe(gulp.dest('./build/css/'))
    .pipe(browserSync.stream());
});


/* ----------------- */
/* HTML
/* ----------------- */

gulp.task('html', ['cssmin'], () => {
  return gulp.src('index.html')
    .pipe(critical.stream({
      'base': 'build/',
      'inline': true,
      'extract': true,
      'minify': true,
      'css': ['./build/css/akwright.css']
    }))
    .pipe(gulp.dest('build'));
});


/* ----------------- */
/* Cssmin
/* ----------------- */

gulp.task('cssmin', () => {
  return gulp.src('./app/assets/sass/**/*.scss')
    .pipe(plugins().sass({
      'outputStyle': 'compressed'
    }).on('error', plugins().sass.logError))
    .pipe(gulp.dest('./build/css/'));
});


/* ----------------- */
/* Jsmin
/* ----------------- */

gulp.task('jsmin', () => {
  var envs = plugins().env.set({
    'NODE_ENV': 'production'
  });

  return browserify({
    'entries': ['./app/assets/scripts/main.js'],
    'debug': false,
    'transform': [
      babelify.configure({
        'presets': ['es2015']
      })
    ]
  })
  .bundle()
  .pipe(source('bundle.js'))
  .pipe(envs)
  .pipe(buffer())
  .pipe(plugins().uglify())
  .pipe(envs.reset)
  .pipe(gulp.dest('./build/js/'));
});

/* ----------------- */
/* Taks
/* ----------------- */

gulp.task('default', ['development']);
gulp.task('deploy', ['html', 'jsmin']);