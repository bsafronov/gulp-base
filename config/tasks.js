// Глобальные плагины
import replace from "gulp-replace"; // Поиск и замена
import plumber from "gulp-plumber"; // Обрабокта ошибок
import notify from "gulp-notify"; // Сообщения (подсказки)
import browserSync from "browser-sync"; // Локальный сервер
import { deleteAsync } from "del" // Ресет папки сборки
import ifPlugin from "gulp-if";

import fileInclude from "gulp-file-include" // Сборщик HTML файлов
import webpHtml from "gulp-webp-html-nosvg" // Преобразование img 
import version from "gulp-version-number"; // Отключение кеширования build-проекта
import dartSass from "sass"; // Непосредственно sass
import gulpSass from "gulp-sass"; // Запуск sass
import rename from "gulp-rename"; // Переименование файлов
import cleanCss from "gulp-clean-css" // Сжатие css 
import webpCss from "gulp-webpcss"; // Вывод WEBP изображений
import autoPrefixer from "gulp-autoprefixer"; // Добавление вендорных префиксов
import groupCssMediaQueries from "gulp-group-css-media-queries" // Группировка медиа-запросов
import webpack from "webpack-stream";
import webp from "gulp-webp";
import imagemin from "gulp-imagemin";
import newer from "gulp-newer";
import svgSprite from "gulp-svg-sprite";
import zipPlugin from "gulp-zip";
import { configFTP } from '../config/ftp.js';
import vinylFTP from 'vinyl-ftp';
import util from 'gulp-util';
// Конвертация шрифтов
import fs from "fs";
import fonter from "gulp-fonter";
import ttf2woff2 from "gulp-ttf2woff2";

const sass = gulpSass(dartSass);


export const ftp = () => {
  configFTP.log = util.log;
  const ftpConnect = vinylFTP.create(configFTP);
  return app.gulp.src(`${app.path.buildFolder}/**/*.*`, {})
    .pipe(plumber(notify.onError({
      title: "FTP",
      message: "Error: <%= error.message %>"
    })))
    .pipe(ftpConnect.dest(`/${app.path.ftp}/${app.path.rootFolder}`));
}

// export const reset = () => {
//   return deleteAsync(app.path.buildFolder)
// }

export const reset = () => {
  deleteAsync(`${app.path.buildFolder}/*.html`)
  deleteAsync(`${app.path.buildFolder}/css/*.css`)
  deleteAsync(`${app.path.buildFolder}/js/*.js`)
  deleteAsync(`${app.path.buildFolder}/img/*.*`)
  return deleteAsync(`${app.path.buildFolder}/fonts/*.*`)
}


export const copy = () => {
  return app.gulp.src(app.path.src.files)
    .pipe(app.gulp.dest(app.path.build.files))
}

export const html = () => {
  return app.gulp.src(app.path.src.html)
    .pipe(plumber(notify.onError({
      title: "HTML",
      message: "Error: <%= error.message %>"
    })))
    .pipe(fileInclude())
    .pipe(replace(/@img\//g, 'img/'))
    .pipe(ifPlugin(app.isBuild, webpHtml()))
    .pipe(ifPlugin(app.isBuild, version({
      'value': '%DT%',
      'append': {
        'key': '_v',
        'cover': 0,
        'to': ['css', 'js',]
      },
      'output': { 'file': 'version.json' }
    })))
    .pipe(app.gulp.dest(app.path.build.html))
    .pipe(browserSync.stream())
}

export const server = () => {
  browserSync.init({
    server: {
      baseDir: `${app.path.build.html}`
    },
    notify: false,
    port: 3000,
  });
}

export const scss = () => {
  return app.gulp.src(app.path.src.scss, { sourcemaps: app.isDev })
    .pipe(plumber(notify.onError({
      title: "SCSS",
      message: "Error: <%= error.message %>"
    })))
    .pipe(ifPlugin(app.isBuild, webpCss({
      webpClass: ".webp",
      noWebpClass: "",
    })))
    .pipe(replace(/@img\//g, '../img/'))
    .pipe(sass({
      outputStyle: "expanded"
    }))
    // Build
    .pipe(ifPlugin(app.isBuild, groupCssMediaQueries()))
    .pipe(ifPlugin(app.isBuild, autoPrefixer({
      grid: true,
      overrideBrowserlist: ["last 3 versions"],
      cascade: true
    })))
    .pipe(ifPlugin(app.isBuild, app.gulp.dest(app.path.build.css)))
    .pipe(ifPlugin(app.isBuild, cleanCss()))
    .pipe(rename({
      extname: ".min.css"
    }))
    //
    .pipe(app.gulp.dest(app.path.build.css))
    .pipe(browserSync.stream())
}

export const js = () => {
  return app.gulp.src(app.path.src.js, { sourcemaps: app.isDev })
    .pipe(plumber(notify.onError({
      title: "JS",
      message: "Error: <%= error.message %>"
    })))
    .pipe(webpack({
      mode: app.isBuild ? "production" : "none",
      output: {
        filename: "app.min.js",
      },
    }))
    .pipe(app.gulp.dest(app.path.build.js))
    .pipe(browserSync.stream())
}

export const img = () => {
  return app.gulp.src(app.path.src.img)
    .pipe(plumber(notify.onError({
      title: "IMG",
      message: "Error: <%= error.message %>"
    })))
    .pipe(newer(app.path.build.img))
    // Build
    .pipe(ifPlugin(app.isBuild, webp()))
    .pipe(ifPlugin(app.isBuild, app.gulp.dest(app.path.build.img)))
    .pipe(ifPlugin(app.isBuild, app.gulp.src(app.path.src.img)))
    .pipe(ifPlugin(app.isBuild, newer(app.path.build.img)))
    .pipe(ifPlugin(app.isBuild, imagemin({
      progressive: true,
      svgoPlugins: [{ removeViewBox: false }],
      interlaced: true,
      optimizationLevel: 3
    })))
    //
    .pipe(app.gulp.dest(app.path.build.img))
    .pipe(app.gulp.src(app.path.src.svg))
    .pipe(app.gulp.dest(app.path.build.img))
    .pipe(browserSync.stream())
}

export const sprite = () => {
  return app.gulp.src(app.path.src.svgicons, {})
    .pipe(plumber(notify.onError({
      title: "SVG",
      message: "Error: <%= error.message %>"
    })))
    .pipe(svgSprite({
      mode: {
        stack: {
          sprite: `../icons/icons.svg`,
          example: true
        }
      }
    }))
    .pipe(app.gulp.dest(app.path.build.img))
}

export const otfToTtf = () => {
  return app.gulp.src(`${app.path.srcFolder}/fonts/*.otf`, {})
    .pipe(plumber(notify.onError({
      title: "FONTS",
      message: "Error: <%= error.message %>"
    })))
    .pipe(fonter({
      formats: ['ttf']
    }))
    .pipe(app.gulp.dest(`${app.path.srcFolder}/fonts/`))
}

export const ttfToWoff = () => {
  return app.gulp.src(`${app.path.srcFolder}/fonts/*.ttf`, {})
    .pipe(plumber(notify.onError({
      title: "FONTS",
      message: "Error: <%= error.message %>"
    })))
    .pipe(fonter({
      formats: ['woff']
    }))
    .pipe(app.gulp.dest(app.path.build.fonts))
    .pipe(app.gulp.src(`${app.path.srcFolder}/fonts/*.ttf`))
    .pipe(ttf2woff2())
    .pipe(app.gulp.dest(app.path.build.fonts))
}

export const fontsStyle = () => {
  let fontsFile = `${app.path.srcFolder}/scss/_fonts.scss`;

  fs.readdir(app.path.build.fonts, function (err, fontsFiles) {
    if (!fontsFiles) return;

    if (fs.existsSync(fontsFile)) {
      return console.log("Файл scss/fonts.scss уже существует. Необходимо удалить для обновления.");
    }

    fs.writeFile(fontsFile, '', cb);

    let newFileOnly;

    for (let i = 0; i < fontsFiles.length; i++) {
      let fontFileName = fontsFiles[i].split('.')[0];

      if (newFileOnly == fontFileName) continue;

      let fontName = fontFileName.split('-')[0] ? fontFileName.split('-')[0] : fontFileName;
      let fontWeight = fontFileName.split('-')[1] ? fontFileName.split('-')[1] : fontFileName;
      let item = fontWeight.toLowerCase();
      switch (item) {
        case 'thin':
          fontWeight = 100;
          break;
        case 'extralight':
          fontWeight = 200;
          break;
        case 'light':
          fontWeight = 300;
          break;
        case 'medium':
          fontWeight = 500;
          break;
        case 'semibold':
          fontWeight = 600;
          break;
        case 'bold':
          fontWeight = 700;
          break;
        case 'extrabold':
        case 'heavy':
          fontWeight = 800;
          break;
        case 'black':
          fontWeight = 900;
          break;
        default:
          fontWeight = 400;
      }

      fs.appendFile(fontsFile, `@font-face {\n\tfont-family: ${fontName};\n\tfont-display: swap;\n\tsrc: url("../fonts/${fontFileName}.woff2") format("woff2"), url("../fonts/${fontFileName}.woff") format("woff");\n\tfont-weight: ${fontWeight};\n\tfont-style: normal;\n}\r\n`, cb);
      newFileOnly = fontFileName;
    }
  });

  return app.gulp.src(`${app.path.srcFolder}`);
  function cb() { }
}

export const zip = () => {
  deleteAsync(`./${app.path.rootFolder}.zip`);
  return app.gulp.src(`${app.path.buildFolder}/**/*.*`, {})
    .pipe(plumber(notify.onError({
      title: "ZIP",
      message: "Error: <%= error.message %>"
    })))
    .pipe(zipPlugin(`${app.path.rootFolder}.zip`))
    .pipe(app.gulp.dest('./'));
}