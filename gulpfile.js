const { src, dest, parallel, series, watch } = require('gulp');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const rename = require( "gulp-rename" );
const uglify = require('gulp-uglify-es').default;
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const cleancss = require('gulp-clean-css');

const imagemin = require('gulp-imagemin');
const imageminGifsicle = require('imagemin-gifsicle');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminSvgo = require('imagemin-svgo');
const imageminOptipng = require('imagemin-optipng');

const newer = require('gulp-newer');
const fileinclude = require('gulp-file-include');
const del = require('del');

const path = {
	build: {
		html:		"build/",
		js:			"build/assets/js/",
		css:		"build/assets/css/",
		img:		"build/assets/img/",
		fonts: 	"build/assets/fonts/"
	},
	src: {
		dir: 		"src/",
		html: 	"src/**/*.{html,htm}",
		js: 		"src/assets/js/**/*.js",
		css: 		"src/assets/scss/**/*.scss",
		img: 		"src/assets/img/**/**/**/*.{jpg,png,svg,gif,ico,webmanifest,xml}",
		fonts: 	"src/assets/fonts/**/*.{eot,ttf,woff,woff2,svg,otf}"
	},
	clean: 		"./build"
};

function browsersync() {
	browserSync.init({ 
		server: { baseDir: path.build.html },
		notify: false, 
		online: true 
	})
}

function fonts() {
	return src(path.src.fonts)
		.pipe(dest(path.build.fonts))
		.pipe(browserSync.stream());
}

function html () {

	return src( path.src.html )
	//.pipe( plumber() )
	.pipe( fileinclude({
		prefix: '@@',
		basepath: '@file'
	}) )
	.pipe( dest( path.build.html ) )
	.pipe( browserSync.stream() );
};

function scripts () {
	return src( path.src.js )
	.pipe( sourcemaps.init() )
	//.pipe(concat('app.min.js'))
	.pipe( uglify() )
	.pipe( rename({
		suffix: ".min"
	}) )
	.pipe( sourcemaps.write() )
	.pipe( dest( path.build.js ) ) 
	.pipe( browserSync.stream() )
}

function styles () {
	return src( path.src.css )
	.pipe( sourcemaps.init() )
	.pipe( sass({
		errLogToConsole: true, 
		outputStyle: "compressed"
	}) )
	//.pipe(concat('main.min.css')) 
	.pipe( autoprefixer({
		overrideBrowserslist: [
			"last 10 versions",
			"> 0.5%",
			"not IE <= 9"
		],
		grid: true,
		cascade: true
	}) )
	.pipe( cleancss({ level: { 1: { specialComments: 0 } }/* , format: 'beautify' */ }) )
	.pipe( rename({
		suffix: ".min"
	}) )
	.pipe( sourcemaps.write() )
	.pipe( dest( path.build.css ) )
	.pipe( browserSync.stream() )
}

function images () {
	return src( path.src.img )
	.pipe( newer( path.build.img ) )
	.pipe( imagemin([
		imageminGifsicle({ interlaced: true }),
		imageminMozjpeg({ quality: 75, progressive: true }),
		imageminSvgo(),
		imageminOptipng({ optimizationLevel: 1 })
	], {
		verbose: true
	} ) ) 
	.pipe( dest( path.build.img ) )
}

function cleandist () {
	return del( path.build.html, { force: true } )
}

function startwatch () {
	watch( path.src.js, scripts );
	watch( path.src.css, styles );
	//watch( path.src.html).on('change', browserSync.reload );
	watch( path.src.html, html );
	watch( path.src.img, images );
	watch( path.src.fonts, fonts );
}

exports.browsersync = browsersync;
exports.cleandist = cleandist;
exports.html = html;
exports.scripts = scripts;
exports.styles = styles;
exports.images = images;
exports.fonts = fonts;

exports.build = series(
	cleandist,
	parallel(
		html, 
		styles, 
		scripts, 
		images,
		fonts
	)
);

//exports.default = parallel( html, styles, scripts, images, startwatch, browsersync );
exports.default = series( 
	cleandist,
	parallel(
		html, 
		styles, 
		scripts, 
		images,
		fonts
	), 
	parallel(
		browsersync,
		startwatch
	)
);